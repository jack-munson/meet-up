import { FrontHeader } from "../components/FrontHeader"
import { HomeHeader } from "../components/HomeHeader"
import { Footer } from "../components/Footer"
import "../styles/Privacy.css"
import { getAuth } from "firebase/auth"

export function Privacy() {
    const auth = getAuth()
    const user = auth.currentUser

    return (
        <div className="privacy-page">
            {user ? <HomeHeader /> : <FrontHeader />}
            <div className="privacy-page-content">
                <div className="sub-header">
                    <div className="sub-header-text">Privacy</div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}