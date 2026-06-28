import os
from dotenv import load_dotenv
from supabase import create_client
import time
load_dotenv()

# Get values
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET")

# Validate env vars early
missing = [k for k, v in {
    "SUPABASE_URL": SUPABASE_URL,
    "SUPABASE_KEY": SUPABASE_KEY,
    "SUPABASE_BUCKET": SUPABASE_BUCKET,
}.items() if not v]
if missing:
    raise EnvironmentError(f"Missing required environment variables: {', '.join(missing)}")



# Initialize client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)




MAX_SIZE_MB = 50
MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024 



class CoreService:
    @staticmethod
    def _verify_file_size(file):
        """verify the file size; returns value error when file is empty or exceeded the limit"""

        if file is None:
            raise ValueError({
                "code":"NO_FILE_PROVIDED",
                "detail":"Please provide file to upload"
            })

        size = file.size  # Django file objects have a .size attribute
        if size == 0:
            raise ValueError({
                "code":"FILE_EMPTY",
                "detail":"File is empty"
            })
        if size > MAX_SIZE_BYTES:
            raise ValueError({
                "code":"REACHED_FILE_SIZE_LIMIT",
                "detail":f"File exceeds {MAX_SIZE_MB} MB limit ({size / 1024 ** 2:.1f} MB)."
            })
            
    @staticmethod
    def upload_file(file):
        """
        Uploads a file to Supabase Storage and returns its public URL.
        
        And formats file name to include the timestamp to avoid duplicate resource error from supabase
        
        """
        print("F"*600)
        print(file)
        print("Z"*600)
        CoreService._verify_file_size(file)


        folder_name = "studyhub/uploads"

        # format file name with timestamp to avoid duplicate resource error from supabase
        base_name = file.name
        name, ext = base_name.rsplit('.', 1)  # split into name and extension
        timestamp = int(time.time() * 1000)
        file_name = f"{folder_name}/{name}_{timestamp}.{ext}"

        try:
            data = file.read()  # works for both InMemoryUploadedFile and TemporaryUploadedFile
            supabase.storage.from_(SUPABASE_BUCKET).upload(file_name, data)
        except FileNotFoundError:
            raise ValueError({
                "code":"FILE_NOT_FOUND",
                "detail":f"{file} cannot be found"
            })
        except Exception as e:
            raise RuntimeError({
                "code":"FILE_UPLOAD_ERROR",
                "detail":f"Error uploading {file}: {e}"
            }) from e
        url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(file_name)
        return {
            "message":f"{file.name} is successfully uploaded",
            "url":url
        }