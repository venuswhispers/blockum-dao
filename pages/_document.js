import Document, { Html, Head, Main, NextScript } from "next/document"; 

export default class MyDocument extends Document { 
    render() { 
        return ( 
            <Html> 
                <Head> 
                    <meta name="description" 
                        content="A site for demonstrating use of _document file" /> 
                    <meta httpEquiv="Content-Type" 
                        content="text/html;charset=UTF-8" /> 
                    <meta name="author" 
                        content="GeeksForGeeks" /> 
                    <meta name="keywords" 
                        content="NextJS,GFG,custom document next,custom app next" /> 
                    <link rel="shortcut icon" 
                        href="https://blockumdao.org/wp-content/uploads/2023/05/Fav.png" 
                        type="image/x-icon" /> 
                    <link rel="stylesheet" href="/index.css" />
                </Head> 
                <body> 
                    <Main /> 
                    <NextScript /> 
                </body> 
            </Html> 
        ) 
    } 
}