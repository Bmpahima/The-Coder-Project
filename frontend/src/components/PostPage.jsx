import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import NavPost from "./NavPost";
import { formatDate } from "./data";
import axios from "axios";

function PostPage() {
    const { userId, postId } = useParams(); 
    const [post, setPost] = useState({});
    const [editedPost, setEditedPost] = useState(post);
    const [postImgFile, setPostImgFile] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:3000/user/${userId}/post/${postId}`) 
            .then(res => res.json())  
            .then(data => {
                setPost(data); 
                setEditedPost(data);
            })
            .catch(error => {
                console.log("Error: " + error);
            });

        fetch(`http://localhost:3000/user/${userId}/post/${postId}/random-posts`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch random posts');
                return res.json();
            })
            .then(data => setRelatedPosts(data))
            .catch(error => console.log("Error:", error));
    }, [userId, postId]); 

    const onEditPost = () => {
        setIsEdit(true);
    }

    const onDrop = useCallback((acceptedFiles) => {
        setPostImgFile(acceptedFiles[0]);  
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });


    const handlePostEdit = (event) => {
        const { name, value } = event.target;
    
        setEditedPost(prevValue => ({
            ...prevValue,
            [name]: value
        }));
    }
    
    const submitPostEdit = (event) => {
        event.preventDefault();
    
        const data = new FormData();
        data.append("title", editedPost.title);
        data.append("description", editedPost.description);
        data.append("content", editedPost.content);
        if (postImgFile) {
            data.append("postImgFile", postImgFile); 
        }
    
        axios.patch(`http://localhost:3000/user/${userId}/post/${postId}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            setIsEdit(false);
            setPost(response.data.post);
            navigate(`/my-posts/user/${userId}`);
        })
        .catch(error => {
            console.error('Error:', error); 
        });
    }
    
    
    const onDeletePost = () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            fetch(`http://localhost:3000/user/${userId}/post/${postId}`, {
                method: "DELETE"
            }) 
            .then(res => res.json())  
            .then(data => {
                if (data.message === "The post has been successfully deleted") {
                    navigate(`/home/user/${userId}`); 
                }
            })
            .catch(error => {
                console.log("Error: " + error);
            });
        }
    };
    

    return (
        <div className="post-page">
            <Header 
                img={post.image}
                title={post.title}
                userId={userId}
             />
            <div className="post-page-body">
                
                <div className="post-page-content">
                {isEdit ? (
                    <div>
                        <form className="post-form-edit-add" onSubmit={submitPostEdit}><br />
                            <input type="text" placeholder="Title" name="title" value={editedPost.title} onChange={handlePostEdit} required/><br />
                            <input type="text" placeholder="description" name="description" value={editedPost.description} onChange={handlePostEdit} required/><br />
                            <textarea type="text" placeholder="content" name="content" value={editedPost.content} onChange={handlePostEdit} required/><br />
                            <div className="img-input">
                                <div {...getRootProps()} className="dropzone">
                                    <input {...getInputProps()}/>
                                    {isDragActive ? (
                                        <p>Drop the files here...</p>
                                    ) : (
                                        <p>Drag your profile image here...</p>
                                    )}
                                </div>
                                {postImgFile && <p>{postImgFile.name}</p>}
                            </div>                            
                            <div className="post-options">
                                <button type="submit">Submit</button>
                                <button onClick={() => setIsEdit(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <>
                        <p className="post-detail">@{post.username} {formatDate(post.date)}</p>
                        <div className="image-wrapper">
                            <img src={post.image} alt="post-image" />
                        </div>
                        <h3>{post.description}</h3>
                        <p>{post.content}</p>
                        { Number(userId) === Number(post.author) && (
                            <div className="post-options">
                                <button onClick={onEditPost}>Edit</button>
                                <button onClick={onDeletePost}>Delete</button>
                            </div>
                        )}
                    </>
                )}

                </div>
                
                {relatedPosts.length > 0 && ( 
                    <div className="posts-nav">
                        <h1>Other Posts</h1>
                        <NavPost 
                            userId={userId}
                            posts={relatedPosts} 
                        />
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default PostPage;
