from bson import ObjectId

def convert_object_ids(data):
    """
    Converte recursivamente os campos do tipo ObjectId para string.
    Também mapeia _id para id para compatibilidade com os modelos Pydantic.
    """
    if isinstance(data, list):
        return [convert_object_ids(item) for item in data]
    elif isinstance(data, dict):
        new_data = {}
        for key, value in data.items():
            if isinstance(value, ObjectId):
                new_data[key] = str(value)
                # If key is '_id', also add an 'id' field with the same value
                if key == '_id':
                    new_data['id'] = str(value)
            else:
                new_data[key] = convert_object_ids(value)
        return new_data
    else:
        return data