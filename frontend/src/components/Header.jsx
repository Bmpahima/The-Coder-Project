import React from "react";
import { useNavigate } from "react-router-dom";

function Header(props) {

    const navigate = useNavigate();

    const onClickHome = () => {
        navigate(`/home/user/${props.userId}`);
    };
    
    const onClickMyPosts = () => {
        navigate(`/my-posts/user/${props.userId}`);
    };

    const handleLogout = () => {
        localStorage.removeItem("token"); 
        navigate("/");
    };

    const onclickContact = () => {
        document.getElementById("footer").scrollIntoView({
            behavior: 'smooth'  
        });
    };

    return (
        <header>
            <nav className="navbar">
                <div onClick={onClickHome}>Home</div>
                <div onClick={onClickMyPosts}>My Posts</div>
                <div onClick={onclickContact}>Contact</div>
                <div onClick={handleLogout}>Log Out</div>
            </nav>
            <div 
                className={props.img ? "header-selected-bg" : "header-background"}
                style={props.img ? { background: `url(${props.img})` } : {}}
            >
                <div className="custom-shape-divider-bottom-1729778907">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="shape-fill"></path>
                    </svg>
                </div>
                    {props.title ? 
                        <div className="home-title">   
                            <h1>{props.title}</h1>
                        </div>
                        :
                        <div className="home-title">   
                            <h1>{"<The Coder />"}</h1>
                            <h3>{"The Official Blog"}</h3>
                        </div>
                    } 
            </div>
        </header>
    );
}


export default Header;
