import * as Yup from "yup";
import translations from "../assets/translation";
import { useSelector } from "react-redux";

const loginValidation = () => {
  const t = translations[useSelector((state) => state.language.language)];

  return Yup.object().shape({
    username: Yup.string()
      .min(3, t.validation_min_username)
      .max(40, t.validation_max_username)
      .required(t.validation_username),
    password: Yup.string()
      .min(8, t.validation_min_psw)
      .max(32, t.validation_max_psw)
      .matches(/[a-z]/, t.validation_psw_small)
      .matches(/[A-Z]/, t.validation_psw_big)
      .matches(/[0-9]/, t.validation_psw_number)
      .matches(/^[a-zA-Z0-9]+$/, `${t.validation_psw_all}`)
      .required(t.validation_psw),
  });
};

const registerValidation = () => {
  const t = translations[useSelector((state) => state.language.language)];

  return Yup.object().shape({
    username: Yup.string()
      .min(3, t.validation_min_username)
      .max(40, t.validation_max_username)
      .matches(/^[a-zA-Z0-9!?_]+$/, t.validation_username_marks)
      .required(t.validation_username),
    email: Yup.string()
      .email(t.validation_email_at_sign)
      .min(5, t.validation_min_email)
      .max(40, t.validation_max_email)
      .required(t.validation_email),
    password: Yup.string()
      .min(8, t.validation_min_psw)
      .max(32, t.validation_max_psw)
      .matches(/[a-z]/, t.validation_psw_small)
      .matches(/[A-Z]/, t.validation_psw_big)
      .matches(/[0-9]/, t.validation_psw_number)
      .matches(/^[a-zA-Z0-9]+$/, `${t.validation_psw_all}`)
      .required(t.validation_psw),
    passwordAgain: Yup.string()
      .oneOf([Yup.ref("password"), null], t.validation_psw_match)
      .required(t.validation_psw_again),
  });
};

const createEventUnSignedValidation = () => {
  const t = translations[useSelector((state) => state.language.language)];

  return Yup.object().shape({
    title: Yup.string()
      .min(2, t.validation_min_title)
      .max(25, t.validation_max_title)
      .required(t.validation_title),
    categoryID: Yup.string().required(t.validation_category),
    dates: Yup.number().required(t.validation_date),
    startTime: Yup.string().required(t.validation_startTime),
    endTime: Yup.string().required(t.validation_endTime),
    participantsMin: Yup.number().required(t.validation_part_min),
    participantsMax: Yup.number().required(t.validation_part_max),
    description: Yup.string()
      .required(t.validation_desc)
      .min(2, t.validation_min_desc)
      .max(1700, t.validation_max_desc),
    email: Yup.string()
      .email(t.validation_email_at_sign)
      .min(5, t.validation_min_email)
      .max(40, t.validation_max_email)
      .required(t.validation_email),
  });
};

const createEventValidation = () => {
  const t = translations[useSelector((state) => state.language.language)];

  return Yup.object().shape({
    title: Yup.string()
      .min(2, t.validation_min_title)
      .max(25, t.validation_max_title)
      .required(t.validation),
    categoryID: Yup.string().required(t.validation_category),
    dates: Yup.number().required(t.validation_date),
    startTime: Yup.string().required(t.validation_startTime),
    endTime: Yup.string().required(t.validation_endTime),
    participantsMin: Yup.number().required(t.validation_part_min),
    participantsMax: Yup.number().required(t.validation_part_max),
    description: Yup.string()
      .required(t.validation_desc)
      .min(2, t.validation_min_desc)
      .max(1700, t.validation_max_desc),
  });
};

const otpValidation = () => {
  const t = translations[useSelector((state) => state.language.language)];

  return Yup.object().shape({
    otp: Yup.string().required(t.validation_otp),
  });
};

export {
  loginValidation,
  registerValidation,
  otpValidation,
  createEventUnSignedValidation,
  createEventValidation,
};
