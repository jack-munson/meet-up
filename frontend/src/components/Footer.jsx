import "./Footer.css"
import { useNavigate } from 'react-router-dom'

export function Footer() {
    const navigate = useNavigate()

    return (
        <div className="footer">
            <div className = "footer-buttons">
                <div className="footer-button" onClick={() => navigate('/privacy')}>PRIVACY</div>
                <div className="footer-button" onClick={() => navigate('/feedback')}>FEEDBACK</div>
            </div>
        </div>
    )
}