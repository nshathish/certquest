import mimetypes


def is_valid_image(file: str) -> bool:
    mime_type, _ = mimetypes.guess_type(file)
    if not mime_type:
        return False
    return bool(mime_type and mime_type.startswith("image"))
