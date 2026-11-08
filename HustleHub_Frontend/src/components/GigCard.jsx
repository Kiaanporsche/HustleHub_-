import { Link } from "react-router-dom";

function GigCard({ gig }) {
    const getGigVisual = () => {
        const content = `${gig.category || ""} ${gig.title || ""}`.toLowerCase();

        if (
            content.includes("design") ||
            content.includes("logo") ||
            content.includes("graphic")
        ) {
            return {
                icon: "✦",
                label: "Creative Design",
                className: "gig-visual-design"
            };
        }

        if (
            content.includes("web") ||
            content.includes("development") ||
            content.includes("developer") ||
            content.includes("coding")
        ) {
            return {
                icon: "</>",
                label: "Web Development",
                className: "gig-visual-development"
            };
        }

        if (
            content.includes("writing") ||
            content.includes("copy") ||
            content.includes("content")
        ) {
            return {
                icon: "Aa",
                label: "Content & Writing",
                className: "gig-visual-writing"
            };
        }

        if (
            content.includes("marketing") ||
            content.includes("social")
        ) {
            return {
                icon: "↗",
                label: "Marketing",
                className: "gig-visual-marketing"
            };
        }

        return {
            icon: "H+",
            label: gig.category || "Freelance Service",
            className: "gig-visual-default"
        };
    };

    const visual = getGigVisual();

    return (
        <article className="gig-card">
            <div className={`gig-card-visual ${visual.className}`}>
                <span className="gig-visual-icon">
                    {visual.icon}
                </span>

                <span className="gig-visual-label">
                    {visual.label}
                </span>
            </div>

            <div className="gig-card-content">
                <span className="gig-category">
                    {gig.category || "General"}
                </span>

                <h3>
                    {gig.title || "Untitled Gig"}
                </h3>

                <p className="gig-description">
                    {gig.description || "No description available."}
                </p>

                <div className="gig-card-footer">
                    <div className="gig-price-block">
                        <span className="gig-price-label">
                            Starting at
                        </span>

                        <span className="gig-price">
                            R{Number(gig.price || 0).toLocaleString()}
                        </span>
                    </div>

                    <Link
                        to={`/gigs/${gig.id}`}
                        className="gig-view-link"
                    >
                        View gig →
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default GigCard;