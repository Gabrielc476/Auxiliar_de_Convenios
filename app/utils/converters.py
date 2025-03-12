from bson import ObjectId

def convert_object_ids(data):
    """
    Converte recursivamente os campos do tipo ObjectId para string.
    """
    if isinstance(data, list):
        return [convert_object_ids(item) for item in data]
    elif isinstance(data, dict):
        new_data = {}
        for key, value in data.items():
            if isinstance(value, ObjectId):
                new_data[key] = str(value)
            else:
                new_data[key] = convert_object_ids(value)
        return new_data
    else:
        return data