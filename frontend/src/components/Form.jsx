import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

function Form(props) {
    const [profileImgFile, setProfileImgFile] = useState(null);
    const [formData, setFormData] = useState({
        type: props.type,
        username: "",
        email: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState(""); 

    const handleChange = (event) => {
        const { name, value } = event.target; 
        setFormData(prevValue => ({
            ...prevValue,
            [name]: value
        }));
    };

    const onDrop = useCallback((acceptedFiles) => {
        setProfileImgFile(acceptedFiles[0]);  
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, 
        accept: {
            'image/jpeg': [],
            'image/jpg': [],
            'image/png': []
        } 
    });

    const handleSubmit = (event) => {
        event.preventDefault();

        const data = new FormData();
        data.append("type", formData.type);
        data.append("username", formData.username);
        data.append("email", formData.email);
        data.append("password", formData.password);
        if (formData.type === "Register") {
            if (profileImgFile) {
                data.append("profileImg", profileImgFile); 
            } else {
                setErrorMessage("Please upload an image.");
                return;
            }
        }

        axios.post('http://localhost:3000/', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            setErrorMessage(""); 
            if (response.data.message === "User registered successfully" || response.data.message === "Authenticated") {
                props.onLogin(response.data.userId); 
            }
        })
        .catch(error => {
            setErrorMessage(error.response.data.error || "An error occurred");
            console.error('Error:', error); 
        });
    };

    return (
        <div className={props.type === "Login" ? "form-login" : "form-register"} >
            <div className={props.type === "Login" ? "form-title form-title-login" : "form-title form-title-register"}>
            </div>
            <form className="form-container" onSubmit={handleSubmit}>
                {props.type === "Register" && (
                    <>
                        <input 
                            type="text" 
                            placeholder="Username" 
                            className="input-field" 
                            onChange={handleChange} 
                            name="username" 
                            value={formData.username}
                            required
                        />
                        <br />
                    </>
                )}
                <input 
                    type="email" 
                    placeholder="Email" 
                    className="input-field" 
                    onChange={handleChange} 
                    name="email" 
                    value={formData.email}
                    required
                />
                <br />
                <div className="password-form" style={{ position: "relative", width: "100%" }}>
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="input-field" 
                        onChange={handleChange} 
                        name="password" 
                        value={formData.password}
                        required
                    />
                    <button className="forgot-password" type="button" style={{visibility: props.type === "Register" ? "hidden": "visible"}} onClick={() => { props.setForgotPassword(true) }}>Forgot Password?</button>
                </div>
                {errorMessage && <p className="error-message">{props.type === "Login" ? "Email or password are invalid. " :errorMessage}</p>}
                {props.type === "Register" && (
                    <div className="img-input">
                        <div {...getRootProps()} className="dropzone">
                            <input {...getInputProps()} />
                            {isDragActive ? (
                                <p>Drop the files here...</p>
                            ) : (
                                <p>Drag your profile image here...</p>
                            )}
                        </div>
                        {profileImgFile && <p>{profileImgFile.name}</p>}
                    </div>
                )}
                <input className="submit-btn" type="submit" value={props.type === "Register" ? "Sign Up" : "Login"} />
                <div className="switch-login-register">
                    <p>
                        {props.type === "Register" ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button onClick={ () => { setErrorMessage(""); props.switch(); } } type="button">
                            {props.type === "Register" ? "Login" : "Sign Up"}
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default Form;
