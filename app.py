from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import psycopg2

host = "72.198.31.89"
database = "zettelkasten"
user="postgres"
password = "gamecubeking"

app = Flask(__name__)
CORS(app)


def get_connection():
    connection = psycopg2.connect(host=host,database=database, user=user, password=password)
    return connection


def is_valid_id(id):
    conn = get_connection()

    sql = """
    SELECT id
    FROM note
    WHERE id = '{}';
    """

    cursor = conn.cursor()

    cursor.execute(sql.format(id))

    result = cursor.fetchone()
    
    conn.close()
    cursor.close()

    return result is None


def get_next_id():
    date = datetime.datetime.now()

    year = str(date.year)
    month = '{:02}'.format(date.month)
    day = '{:02}'.format(date.day)

    id=year+month+day+"a"
    return id



def get_next_valid_id():
    conn = get_connection()
    potential_id = list(get_next_id())

    while not is_valid_id("".join(potential_id)):
        if potential_id[-1] == 'z':
            potential_id.append('a')
        else:
            potential_id[-1] = chr(ord(potential_id[-1]) + 1)

    return "".join(potential_id)


def get_owner_of_note(id):
    conn = get_connection()
    cursor = conn.cursor()

    sql= """
    SELECT owner
    FROM note
    WHERE id = %s;
    """

    cursor.execute(sql, (id,))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    return result[0]

def get_body_of_note(id):
    conn = get_connection()
    cursor = conn.cursor()

    sql= """
    SELECT body
    FROM note
    WHERE id = %s;
    """

    cursor.execute(sql, (id,))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    return result[0]


def get_tags_of_note(id):
    conn = get_connection()
    cursor = conn.cursor()

    sql= """
    SELECT tags
    FROM note
    WHERE id = %s;
    """

    cursor.execute(sql, (id,))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    return result[0]


@app.route('/create', methods=['POST'])
def create():
    body = request.get_json()['body']
    tags = request.get_json()['tags']
    owner = request.get_json()['owner']
    id = get_next_valid_id()

    sql="""
    INSERT INTO note (id, body, tags, owner) VALUES (%s, %s, %s, %s);
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(sql, (id, body, tags, owner))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify(id=id)


@app.route('/doesUserExist', methods=['POST'])
def doesUserExist():
    user = request.get_json()['user']

    sql="""
    SELECT name FROM usernames WHERE lower(name) = lower(%s) and lower(%s) != 'public';
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(sql, (user,user))

    cursor.close()
    conn.close()

    if cursor.rowcount > 0:
        return 'true'
    else:
        return 'false'



@app.route('/edit', methods=['POST'])
def edit():
    id = request.get_json()['id']
    new_body = request.get_json()['body']
    new_tags = request.get_json()['tags']
    user = request.get_json()['user']

    owner = get_owner_of_note(id)

    if owner == 'public':
        new_body = get_body_of_note(id) + "\n\n" + new_body
        new_tags = get_tags_of_note(id) + ", " + new_tags


    sql="""
    UPDATE note SET body = %s, tags = %s
    WHERE id = %s and (owner = %s or owner = 'public');
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(sql, (new_body, new_tags, id, user))
    conn.commit()

    cursor.close()
    conn.close()

    if cursor.rowcount == 0:
        return "NO NOTE FOUND WITH ID " + id + " OR IT CANNOT BE EDITED"
    else:
        return "NOTE EDITED SUCCESSFULLY"





@app.route('/searchById', methods=['POST'])
def search_by_id():
    id = request.get_json()['id']
    user = request.get_json()['user']

    sql = """
    SELECT body, tags
    FROM note
    WHERE id = %s and (owner = 'public' or owner = %s);
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(sql, (id, user))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if result is None:
        return "NO NOTE FOUND WITH ID " + id

    return jsonify(body=result[0], tags=result[1])



@app.route('/searchByTag', methods=['POST'])
def search_by_tag():
    tag = request.get_json()['tag']
    user = request.get_json()['user']

    sql = """
    SELECT id, body, tags
    FROM note
    WHERE position(LOWER(%s) in LOWER(tags))>0 and (owner = 'public' or owner = %s);
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(sql, (tag, user))
    result = cursor.fetchall()

    cursor.close()
    conn.close()

    if len(result) == 0:
        return "NO NOTE FOUND WITH TAG " + tag

    return_list = [(x[0], x[1], x[2]) for x in result]

    return jsonify(return_list)


@app.route('/searchByText', methods=['POST'])
def search_by_text():
    text = request.get_json()['text']
    user = request.get_json()['user']


    sql = """
    SELECT id, body, tags
    FROM note
    WHERE position(LOWER(%s) in LOWER(body))>0 and (owner = 'public' or owner = %s);
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(sql, (text, user))
    result = cursor.fetchall()

    cursor.close()
    conn.close()

    if len(result) == 0:
        return "NO NOTE FOUND WITH " + text + " IN BODY"

    return_list = [(x[0], x[1], x[2]) for x in result]

    return jsonify(return_list)



@app.route('/getPermissions', methods=['POST'])
def get_permissions():
    user = request.get_json()['user']
    id = request.get_json()['id']


    sql = """
    SELECT owner
    FROM note
    WHERE id = %s;
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(sql, (id,))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if result is None:
        return "d"

    elif result[0] == 'public':
        return "a"

    elif result[0] == user:
        return "e"

    else:
        return "d"



@app.route('/delete', methods=['POST'])
def delete():
    id = request.get_json()['id']
    user = request.get_json()['user']

    sql="""
        DELETE FROM note
        WHERE id = %s and owner = %s;
        """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(sql, (id, user))

    conn.commit()
    cursor.close()
    conn.close()

    if cursor.rowcount == 0:
        return "NO NOTE FOUND WITH ID " + id + ", OR IT CANNOT BE DELETED"
    else:
        return "NOTE DELETED"


if __name__ == '__main__':
    app.run()