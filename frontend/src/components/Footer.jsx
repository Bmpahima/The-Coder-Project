import React from "react";

function Footer() {
    return (
        <footer id="footer">
                <div className="waves-footer">
                    <div className="wave-footer" id="wave11"></div>
                    <div className="wave-footer" id="wave21" ></div>
                    <div className="wave-footer" id="wave31" ></div>
                    <div className="wave-footer" id="wave41" ></div>
                </div>
                <div className="footer">
                    <div className="footer-content">© {new Date().getFullYear()}</div>
                </div>
            
        </footer>
    );
}

export default Footer;