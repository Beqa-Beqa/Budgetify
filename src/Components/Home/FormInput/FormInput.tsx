import "./formInput.css";

const FormInput = (props: {
  title: string,
  children: React.ReactNode,
  alert?: boolean,
  required?: boolean,
  classname?: string
}) => {
  return (
    <fieldset className={`${props.classname} ${props.alert && "alert-input"} px-1 position-relative`}>
      <legend>{props.title} {props.required && <span style={{color: "var(--danger)", opacity: 0.7}}>*</span>}</legend>
      {props.children}
    </fieldset>
  );
}

export default FormInput;