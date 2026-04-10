import requests, pathlib
from pypdf import PdfWriter
path = pathlib.Path('tmp_test.pdf')
writer = PdfWriter()
writer.add_blank_page(width=72, height=72)
with path.open('wb') as f:
    writer.write(f)
try:
    r = requests.post('http://127.0.0.1:8001/api/upload', files={'file': ('tmp_test.pdf', path.read_bytes(), 'application/pdf')})
    print('status', r.status_code)
    print(r.text)
except Exception as e:
    print('error', e)
finally:
    path.unlink(missing_ok=True)
