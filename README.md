# Library resource management repository.

## Steps to run-
### Configure frontend (all commands need to be run in frontend directory) :
    1. Download and install Node for your system
    2. Run the below commands to install dependencies
       first move into the frontend folder and install dependecies
       npm install
       npm i tailwindcss vite axios react-router-dom react-icons postcss autoprefixer
       npx tailwindcss init -p
       npm i @reduxjs/toolkit react-redux
    for icons:
    npm install @fortawesome/fontawesome-svg-core
    npm install @fortawesome/free-brands-svg-icons  // For brand icons (Instagram, etc.)
    npm install @fortawesome/free-solid-svg-icons   // For solid icons (if you need any)
    npm install @fortawesome/free-regular-svg-icons // For regular icons (if you need any)
    npm install @fortawesome/react-fontawesome
    3. To run the project run ~$ npm run dev


### Configure Backend (all command nneeds to be run in repository directory) : 
    1. Install Python on your system
    2. Install the dependecies from requirements.txt file
        pip3 install -r requirements.txt
    3. To run the server run ~$ python3 manage.py runserver
