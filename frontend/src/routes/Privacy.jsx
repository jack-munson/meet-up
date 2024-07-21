import { HomeHeader } from "../components/HomeHeader"
import { Footer } from "../components/Footer"
import "../styles/Privacy.css"

export function Privacy() {
    return (
        <div className="privacy-page">
            <HomeHeader/>
            <div className="privacy-page-content">
                <div className="sub-header">
                    <div className="sub-header-text">Privacy</div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}