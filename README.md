# Search-GPT - An Agent Assistant Application

Search-GPT is an agent assistant application that helps agents extract data from text, HTML, and websites using the OpenAI API. The extracted data can be used to answer questions or provide insights to customers.

This application was built using Node.js and various Node.js packages, such as Express, Puppeteer, Axios, and Cheerio. It also uses the OpenAI API to extract data from text and HTML.

## Features

- Extract text from a website
- Extract a specific element from an HTML page
- Extract information from text
- Login and Signup
- Store user search history

## Installation

To run this application, follow these steps:

1. Clone this repository
    ```bash
    git clone https://github.com/brocketdesign/search-GPT.git
    ```

2. Navigate to the project directory
    ```bash
    cd search-GPT
    ```

3. Install the dependencies
    ```bash
    npm install
    ```

4. Create a `.env` file in the project root directory with the following content:

    ```makefile
    COOKIE_SECRET=<your_cookie_secret>
    MONGODB_URL=<your_mongodb_url>
    OPENAI_API_KEY=<your_openai_api_key>
    ```

5. Start the application
    ```sql
    npm start
    ```

6. Navigate to `http://localhost:8001` in your browser to access the application

## Usage

To use the application, follow these steps:

1. Enter a URL in the input field and a question in the "Enter your question" input field.
2. Click the "Submit" button.
3. Wait for the application to extract data from the website.
4. The extracted data will be displayed on the page.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
