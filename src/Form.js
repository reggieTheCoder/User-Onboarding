import React, { useState, useEffect } from "react";
import * as yup from "yup"; // DOCS: https://github.com/jquense/yup
import axios from "axios";

export default function Form() {
  // can declare initialState once and use as initial state for form, for errors, and reset form
  const initialFormState = {
    name: "",
    email: "",
    password: "",
    roles: "",
    phone: "",
    favProgrammingLanguage: "",
    terms: false
  };

  // temporary state used to set state
  const [post, setPost] = useState([]);

  // server error
  const [serverError, setServerError] = useState("");

  // managing state for our form inputs
  const [formState, setFormState] = useState(initialFormState);

  // control whether or not the form can be submitted if there are errors in form validation
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // managing state for errors. empty unless inline validation (validateInput) updates key/value pair to have error
  const [errors, setErrors] = useState(initialFormState);

  //regex for phone number validation
  const phoneRegExp = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/

  // /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
  

  // schema used for all validation to determine whether the input is valid or not
  const formSchema = yup.object().shape({
    name: yup
    .string()
    .required("Name is a required field"),

    email: yup
      .string()
      .email("must be a valid email address")
      .required(),

    password: yup
      .string()
      .min(8, "Password must be 8 characters or longer")
      .required('Password is required'),

      roles: yup
      .string()
      .required("Please choose a role"),

      favProgrammingLanguage: yup
      .string()
      .required("Please choose a Programming Language"),

    phone: yup
      .string()
      .min(10, "Phone must be at least 10 digits or longer")
      // .typeError("Please enter a number")
      // .positive("Phone number cannot start with a minus")
      // .integer("Phone cannnot include a decimal point")
      
      // .string()
      // .matches(phoneRegExp, 'Phone number is not vald')
      .required('Phone is required'),
      
    terms: yup
    .bool()
    .oneOf([true], "Please accept the terms and conditions"),
  });

  // inline validation, validating one key/value pair
  const validateChange = e => {
    yup
      .reach(formSchema, e.target.name) // get the value out of schema at key "e.target.name" --> "name="
      .validate(e.target.value) // value in input
      .then(valid => {
        // if passing validation, clear any error
        setErrors({ ...errors, [e.target.name]: "" });
      })
      .catch(err => {
        // if failing validation, set error in state
        console.log("error!", err);
        setErrors({ ...errors, [e.target.name]: err.errors[0] });
      });
  };

  // whenever state updates, validate the entire form. if valid, then change button to be enabled.
  useEffect(() => {
    formSchema.isValid(formState).then(valid => {
      console.log("valid?", valid);
      setIsButtonDisabled(!valid);
    });
  }, [formState]);

  // onSubmit function
  const formSubmit = e => {
    e.preventDefault();

    // send out POST request with obj as second param, for us that is formState.
    axios
      .post("https://reqres.in/api/users", formState)
      .then(response => {
        // update temp state with value to display
        setPost(response.data);

        // clear state, could also use 'initialState' here
        setFormState({
          name: "",
          email: "",
          password:"",
          roles:"",
          phone:"",
          favProgrammingLanguage: "",
          terms:false
        });

        // clear any server error
        setServerError(null);
      })
      .catch(err => {
        // this is where we could create a server error in the form!
        setServerError("oops! something happened!");
      });
  };

  // onChange function
  const inputChange = e => {
    e.persist(); // necessary because we're passing the event asyncronously and we need it to exist even after this function completes (which will complete before validateChange finishes)
    const newFormData = {
      ...formState,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value
    }; // remember value of the checkbox is in "checked" and all else is "value"
    validateChange(e); // for each change in input, do inline validation
    setFormState(newFormData); // update state with new data
  };

  return (
    <div className="wrapper">
    <h1>User Onboarding</h1>
    <form onSubmit={formSubmit}>
        {serverError ? <p className="error">{serverError}</p> : null}
        {/* Input for Name */}
      <label htmlFor="name">
        Name
        <input
          id="name"
          type="text"
          name="name"
          onChange={inputChange}
          value={formState.name}
        />
        {errors.name.length > 0 ? <p className="error">{errors.name}</p> : null}
      </label>

       {/* Input for Email */}
      <label htmlFor="email">
        Email
        <input
          type="text"
          name="email"
          onChange={inputChange}
          value={formState.email}
        />
        {errors.email.length > 0 ? (
          <p className="error">{errors.email}</p>
        ) : null}
      </label>

             {/* Input for Password */}
             <label htmlFor="password">
        Password
        <input
          type="password"
          name="password"
          onChange={inputChange}
          value={formState.password}
        />
        {errors.password.length > 0 ? (
          <p className="error">{errors.password}</p>
        ) : null}
      </label>

      {/* Input for Phone */}
      <label htmlFor="phone">
        Phone
        <input
          type="phone"
          name="phone"
          onChange={inputChange}
          value={formState.phone}
        />
        {errors.phone.length > 0 ? (
          <p className="error">{errors.phone}</p>
        ) : null}
      </label>

      {/* Drop down for roles */}
      <label htmlFor="roles">
        Role
        <select id="roles" name="roles" onChange={inputChange}>
          <option value="">-- Please choose an option--</option>
          <option value="junior-developer">Junior Developer</option>
          <option value="developer">Developer</option>
          <option value="senior-developer">Senior Developer</option>
          <option value="full-stack">Full Stack</option>
        </select>
        {errors.roles.length > 0 ? (
          <p className="error">{errors.roles}</p>
        ) : null}
      </label>

        {/* Drop down for Favorite Programming language */}
        <label htmlFor="favProgrammingLanguage">
        Favorite Programming Language
        <select id="favProgrammingLanguage" name="favProgrammingLanguage" onChange={inputChange}>
          <option value="">-- Please choose an option--</option>
          <option value="vanilla-javascript">Vanilla JavaScript</option>
          <option value="java">Java</option>
          <option value="c#">C#</option>
          <option value="python">Python</option>
        </select>
        {errors.favProgrammingLanguage.length > 0 ? (
          <p className="error">{errors.favProgrammingLanguage}</p>
        ) : null}
      </label>
     
            {/* Checkbox for terms and conditions */}
      <label htmlFor="terms" className="terms">
        <input
          type="checkbox"
          name="terms"
          checked={formState.terms}
          onChange={inputChange}
        />

        Terms & Conditions
      </label>
      <pre>{JSON.stringify(post, null, 2)}</pre>
      <button disabled={isButtonDisabled} type="submit">
        Submit
      </button>
    </form>
    </div>
  );
}
