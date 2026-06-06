from fastapi import FastAPI
def main():
    app = FastAPI()
    @app.get('/health')
    async def health():
        return {'status': 'ok'}
if __name__ == '__main__':
    main()