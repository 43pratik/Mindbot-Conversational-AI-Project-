import langchain, pkgutil, importlib
print('langchain', langchain.__version__, langchain.__file__)
mods = [m.name for m in pkgutil.iter_modules(langchain.__path__) if 'document' in m.name or 'loaders' in m.name]
print('submodules containing document/loaders:', mods)
print('find_spec langchain.document_loaders:', importlib.util.find_spec('langchain.document_loaders'))
print('find_spec langchain.document_loaders.py_pdf:', importlib.util.find_spec('langchain.document_loaders'))
try:
    from langchain.document_loaders import PyPDFLoader
    print('PyPDFLoader imported')
except Exception as e:
    print('PyPDFLoader error:', type(e), e)
