import React from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "./data";

function Post(props) {

    const navigate = useNavigate();

    const onHoverPost = (event) => {
        event.currentTarget.classList.add('post-hover');
    }

    const onLeavePost = (event) => {
        event.currentTarget.classList.remove('post-hover');
    }

    const handleLearnMore = (event) => {
        event.preventDefault();  
        navigate(`/user/${props.userId}/post/${props.postId}`);
    };

    return (
        <div 
            className="post"
            onMouseEnter={onHoverPost}
            onMouseLeave={onLeavePost}
        >
            <div 
                className="post-background" 
                style={{
                    background: `url(${props.img || 'default.jpg'})`,
                    backgroundSize: 'cover'
                }}
            ></div>

            <div className="post-image"><img src={props.profileImg} alt={props.title} /></div>
            <div className="post-content">
                <h1 className="post-title">{props.title}</h1>
                <p className="post-date">{formatDate(props.date)}</p>
                <p className="post-description">{props.description}</p>
                <button type="button" className="learn-more-btn" onClick={handleLearnMore}>Learn More</button>
            </div>
        </div>
    );
}

export default Post;
