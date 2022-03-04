# Run the following commands in a python virtual environment

# Install python packages
install:
	pip install --upgrade pip setuptools wheel && pip install -r requirements.txt

# Install npm packages and run grunt build process
build:
	npm install && npm run build

# Source environment variables and run django app
# Have to access the app in your browser on localhost:8000 NOT 0.0.0.0:8000
serve:
	source .env && python manage.py runserver 0.0.0.0:8000
