import React from "react";
import styles from "./avtar.scss";
import { Avatar } from "@mui/material";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";


interface ProfilePictureProps {
    profileUrl?: string;
    width?: number | string;
    height?: number | string;
    alt?: string;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
    profileUrl,
    width = 40,
    height = 40,
    alt = "profile",
}) => {

    return (
        <Avatar
            alt={alt}
            src={profileUrl || defaultProfileIcon}
            sx={{
                width,
                height,
                border: "1px solid #fffff",
            }}
            data-testid="user-avatar"
        />
    );
};

export default ProfilePicture;
