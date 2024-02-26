import "../../CSS/Components/formInput.css";

const FormInput = (props: {
  title: string,
  children: React.ReactNode,
  alert?: boolean,
  required?: boolean,
  classname?: string
}) => {
  return (
    <fieldset className={`${props.classname} ${props.alert && "alert-input"} mx-5 position-relative`}>
      <legend>{props.title} {props.required && <span style={{color: "var(--danger)"}}>*</span>}</legend>
      {props.children}
    </fieldset>
  );
}

export default FormInput;