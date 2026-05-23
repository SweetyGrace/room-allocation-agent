import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { incrementCount } from "../../actions/AppActions";
import { Button } from "../../common/components/Button";
import { DisplayCount } from "../../components/DisplayCount";
import { ABOUT, INCREMENT } from "../../constants";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import styles from "./index.module.scss";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const schema = yup.object().shape({
  phone: yup
    .string()
    .required("Phone number is required")
    .test(
      "is-valid-phone",
      "Phone number is invalid or does not match the country code",
      (value) => {
        const phoneNumber = parsePhoneNumberFromString(`+${value}`);
        return phoneNumber ? phoneNumber.isValid() : false;
      },
    ),
});

interface AppState {
  appReducer: {
    count: number;
  };
}

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const count = useSelector((state: AppState) => state.appReducer.count);

  const [phone, setPhone] = useState<string>("91");

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  const onSubmit = (data) => {
  };

  const handleIncrement = () => {
    dispatch(incrementCount());
  };

  const navigateToAbout = () => {
    navigate("/about");
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} data-testid="form">
        <DisplayCount
          count={count}
          userName="Divami"
          data-testid="display-count"
        />
        <Button onClick={handleIncrement} datatestid="increment-button" datatestidText="increment">
          {INCREMENT}
        </Button>
        <Button onClick={navigateToAbout} datatestid="about-button" datatestidText="about">
          {ABOUT}
        </Button>
        <div data-testid="phone-input-container">
          <PhoneInput
            country={"IN"}
            value={phone}
            onChange={(phone) => {
              setPhone(phone);
              setValue("phone", phone);
            }}
            containerClass={styles.customContainer}
            inputClass={styles.customInput}
            buttonClass={styles.customButton}
            dropdownClass={styles.customDropdown}
            enableSearch={true}
            disableSearchIcon={true}
            data-testid="phone-input"
          />
          {errors.phone && (
            <p style={{ color: "red" }} data-testid="phone-error">
              {errors.phone.message}
            </p>
          )}
        </div>
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Home;
