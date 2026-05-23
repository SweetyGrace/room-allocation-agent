import React, { useEffect, useState } from 'react';
import styles from "./index.module.scss";
import { Avatar } from '@mui/material';
import durationIcon from "../../../assets/images/duration-icon.svg"
import { formateTimeSpentDuration, modifyProfileUrl } from '../../../utils/commonFunctions';
import defaultIcon from "../../../assets/images/default-profile.svg"
import { colorizeMahatriaInfinitheism } from '../ColorizeMahatriaInfinitheism';

interface SeekerProfileDetailsProps {
    seekerProfileData: unknown[];
    totalSpentDuration: number;
}


const SeekerProfileDetails: React.FC<SeekerProfileDetailsProps> = ({
    seekerProfileData = [],
    totalSpentDuration
}) => {
    const [profileData, setProfileData] = useState<unknown[]>([]);
    const [profileUrl, setProfileUrl] = useState<string>(defaultIcon);
    useEffect(() => {
        seekerProfileData?.forEach((data: unknown) => {
            const profileDetails = {
                fullName: data?.fullName,
                mobileNumber: data?.mobileNumber,
                profileUrl: data?.profileUrl,
                countryCode: data?.countryCode,
                gender: data?.gender,
                age: data?.age,
                email: data?.email,
                location: data?.address,
            };
            setProfileData(profileDetails);
            setProfileUrl(data?.profileUrl);
        }
        );
    }, [seekerProfileData]);

    return (
        <div className={styles.seekerProfileDetails}>
            <div
                className={styles.appIconDiv}
                data-testid="app-icon-div"
            >
                <div
                    className={styles.profileIconDiv}
                    data-testid="profile-icon-div"
                >
                    <Avatar
                        alt="Remy Sharp"
                        key={Date.now()}
                        src={profileUrl !== null ? modifyProfileUrl(profileUrl) : defaultIcon} // Add version to force reload
                        sx={{
                            width: 100,
                            height: 100,
                            border: "2px solid rgb(255, 255, 255)",
                            boxShadow: "0px 0px 40px 0px #00000026",
                        }}
                        data-testid="profile-avatar"
                    />
                    {/* To upload image from gallery */}
                </div>
                <div
                    className={styles.DetailsAuthentication}
                    data-testid="seeker-details"
                >
                    <div className={styles.profileData}>
                        <p
                            className={styles.name}
                            data-testid="seeker-name"
                        >
                            {colorizeMahatriaInfinitheism(profileData?.fullName)}
                        </p>
                        <div className={styles.seekerNumber} >
                            {profileData?.gender && (
                                <>
                                    <div>
                                        {profileData?.gender
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div className={styles.verticalDivider2}></div>
                                </>
                            )}

                            {profileData?.age && (
                                <>
                                    <div>
                                        {profileData?.age}

                                    </div>
                                    <div className={styles.verticalDivider2}></div>
                                </>
                            )}

                            {profileData?.location && (
                                <div>
                                    {profileData?.location}
                                </div>
                            )}
                        </div>
                        <div className={styles.seekerNumber}>
                            <p data-testid="seeker-phone-number">
                                {profileData?.countryCode?.startsWith("+")
                                    ? profileData.countryCode
                                    : `+${profileData?.countryCode || ""}`}{" "}
                                {profileData?.mobileNumber
                                    ? profileData.mobileNumber
                                    : ""}
                            </p>
                            <div className={styles.verticalDivider2}></div>
                            {profileData?.email && (
                                <div>
                                    {profileData?.email}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.duration}>
                <img src={durationIcon} alt="timer icon" />
                <div className={styles.durationText}>
                    <span className={styles.timeStyles}>{formateTimeSpentDuration(totalSpentDuration)}</span>
                    <span className={styles.timeSpent}>Time spent</span>
                </div>
            </div>
        </div>
    );
};

export default SeekerProfileDetails;