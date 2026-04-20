Skip to content
Home
Get Started
API
TS
Advanced
FAQs
Tools ▼
Form Builder
DevTools
Resources ▼
Articles
Videos
Newsletters
3rd Party Bindings
Releases
♥
Search...

Get Started
Simple form validation with React Hook Form.

Menu
</>
Quick start
</>
React Web Video Tutorial
</>
Register fields
</>
Apply validation
</>
Integrating an existing form
</>
Integrating with UI libraries
</>
Integrating Controlled Inputs
</>
Integrating with global state
</>
Handle errors
</>
Integrating with services
</>
Schema Validation
</>
React Native
</>
TypeScript
</>
Design and philosophy
ads via Carbon
Get the Drop. Weekly front-end tools, tips, and resources. Plus a free icon pack to get you started.
ads via Carbon
Installation
Installing React Hook Form only takes a single command and you're ready to roll.

Copy
npm install react-hook-form
Example
The following code excerpt demonstrates a basic usage example:

TS
JS
Copy
CodeSandbox
TS
import { useForm, SubmitHandler } from "react-hook-form"

type Inputs = {
  example: string
  exampleRequired: string
}

export default function App() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>()
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)

  console.log(watch("example")) // watch input value by passing the name of it

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* register your input into the hook by invoking the "register" function */}
      <input defaultValue="test" {...register("example")} />

      {/* include validation with required or other standard HTML validation rules */}
      <input {...register("exampleRequired", { required: true })} />
      {/* errors will return when field validation fails  */}
      {errors.exampleRequired && <span>This field is required</span>}

      <input type="submit" />
    </form>
  )
}
React Web Video Tutorial
This video tutorial illustrates the basic usage and concepts of React Hook Form.


Register fields
One of the key concepts in React Hook Form is to register your component into the hook. This will make its value available for both the form validation and submission.

Note: Each field is required to have a name as a key for the registration process.

TS
JS
Copy
CodeSandbox
TS
import ReactDOM from "react-dom"
import { useForm, SubmitHandler } from "react-hook-form"

enum GenderEnum {
  female = "female",
  male = "male",
  other = "other",
}

interface IFormInput {
  firstName: string
  gender: GenderEnum
}

export default function App() {
  const { register, handleSubmit } = useForm<IFormInput>()
  const onSubmit: SubmitHandler<IFormInput> = (data) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>First Name</label>
      <input {...register("firstName")} />
      <label>Gender Selection</label>
      <select {...register("gender")}>
        <option value="female">female</option>
        <option value="male">male</option>
        <option value="other">other</option>
      </select>
      <input type="submit" />
    </form>
  )
}
Apply validation
React Hook Form makes form validation easy by aligning with the existing HTML standard for form validation.

List of validation rules supported:

required
min
max
minLength
maxLength
pattern
validate
You can read more detail on each rule in the register section.

TS
JS
Copy
CodeSandbox
TS
import { useForm, SubmitHandler } from "react-hook-form"

interface IFormInput {
  firstName: string
  lastName: string
  age: number
}

export default function App() {
  const { register, handleSubmit } = useForm<IFormInput>()
  const onSubmit: SubmitHandler<IFormInput> = (data) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName", { required: true, maxLength: 20 })} />
      <input {...register("lastName", { pattern: /^[A-Za-z]+$/i })} />
      <input type="number" {...register("age", { min: 18, max: 99 })} />
      <input type="submit" />
    </form>
  )
}
Integrating an existing form
Integrating an existing form should be simple. The important step is to register the component's ref and assign relevant props to your input.

TS
JS
Copy
CodeSandbox
TS
import { Path, useForm, UseFormRegister, SubmitHandler } from "react-hook-form"

interface IFormValues {
  "First Name": string
  Age: number
}

type InputProps = {
  label: Path<IFormValues>
  register: UseFormRegister<IFormValues>
  required: boolean
}

// The following component is an example of your existing Input Component
const Input = ({ label, register, required }: InputProps) => (
  <>
    <label>{label}</label>
    <input {...register(label, { required })} />
  </>
)

// you can use React.forwardRef to pass the ref too
const Select = React.forwardRef<
  HTMLSelectElement,
  { label: string } & ReturnType<UseFormRegister<IFormValues>>
>(({ onChange, onBlur, name, label }, ref) => (
  <>
    <label>{label}</label>
    <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
      <option value="20">20</option>
      <option value="30">30</option>
    </select>
  </>
))

const App = () => {
  const { register, handleSubmit } = useForm<IFormValues>()

  const onSubmit: SubmitHandler<IFormValues> = (data) => {
    alert(JSON.stringify(data))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input label="First Name" register={register} required />
      <Select label="Age" {...register("Age")} />
      <input type="submit" />
    </form>
  )
}
Integrating with UI libraries
React Hook Form has made it easy to integrate with external UI component libraries. If the component doesn't expose input's ref, then you should use the Controller component, which will take care of the registration process.

TS
JS
Copy
CodeSandbox
TS
import Select from "react-select"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { Input } from "@material-ui/core"

interface IFormInput {
  firstName: string
  lastName: string
  iceCreamType: { label: string; value: string }
}

const App = () => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      iceCreamType: {},
    },
  })

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="firstName"
        control={control}
        render={({ field }) => <Input {...field} />}
      />
      <Controller
        name="iceCreamType"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            options={[
              { value: "chocolate", label: "Chocolate" },
              { value: "strawberry", label: "Strawberry" },
              { value: "vanilla", label: "Vanilla" },
            ]}
          />
        )}
      />
      <input type="submit" />
    </form>
  )
}
Integrating Controlled Inputs
This library embraces uncontrolled components and native HTML inputs. However, it's hard to avoid working with external controlled components such as shadcn/ui, React-Select, AntD and MUI. To make this simple, we provide a wrapper component, Controller, to streamline the integration process while still giving you the freedom to use a custom register.

Using Component API
TS
JS
shadcn/ui
Copy
CodeSandbox
TS
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { TextField, Checkbox } from "@material-ui/core"

interface IFormInputs {
  TextField: string
  MyCheckbox: boolean
}

function App() {
  const { handleSubmit, control, reset } = useForm<IFormInputs>({
    defaultValues: {
      MyCheckbox: false,
    },
  })
  const onSubmit: SubmitHandler<IFormInputs> = (data) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="MyCheckbox"
        control={control}
        rules={{ required: true }}
        render={({ field }) => <Checkbox {...field} />}
      />
      <input type="submit" />
    </form>
  )
}
Using Hooks API
TS
JS
Copy
CodeSandbox
TS
import * as React from "react"
import { useForm, useController, UseControllerProps } from "react-hook-form"

type FormValues = {
  FirstName: string
}

function Input(props: UseControllerProps<FormValues>) {
  const { field, fieldState } = useController(props)

  return (
    <div>
      <input {...field} placeholder={props.name} />
      <p>{fieldState.isTouched && "Touched"}</p>
      <p>{fieldState.isDirty && "Dirty"}</p>
      <p>{fieldState.invalid ? "invalid" : "valid"}</p>
    </div>
  )
}

export default function App() {
  const { handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      FirstName: "",
    },
    mode: "onChange",
  })
  const onSubmit = (data: FormValues) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input control={control} name="FirstName" rules={{ required: true }} />
      <input type="submit" />
    </form>
  )
}
Integrating with global state
This library doesn't require you to rely on a state management library, but you can easily integrate with them.

Copy
import { useForm } from "react-hook-form"
import { connect } from "react-redux"
import updateAction from "./actions"

export default function App(props) {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  })
  // Submit your data into Redux store
  const onSubmit = (data) => props.updateAction(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName")} />
      <input {...register("lastName")} />
      <input type="submit" />
    </form>
  )
}

// Connect your component with redux
connect(
  ({ firstName, lastName }) => ({ firstName, lastName }),
  updateAction
)(YourForm)
Handle errors
React Hook Form provides an errors object to show you the errors in the form. errors' type will return given validation constraints. The following example showcases a required validation rule.

Copy
CodeSandbox
JS
import { useForm } from "react-hook-form"

export default function App() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm()
  const onSubmit = (data) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("firstName", { required: true })}
        aria-invalid={errors.firstName ? "true" : "false"}
      />
      {errors.firstName?.type === "required" && (
        <p role="alert">First name is required</p>
      )}

      <input
        {...register("mail", { required: "Email Address is required" })}
        aria-invalid={errors.mail ? "true" : "false"}
      />
      {errors.mail && <p role="alert">{errors.mail.message}</p>}

      <input type="submit" />
    </form>
  )
}
Integrating with services
To integrate React Hook Form with a service, you can use the library's built-in submission handling. <Form /> component allow you to easily send form data to an API endpoint or other service. Find out more about Form component.

import { Form } from "react-hook-form"

function App() {
  const { register, control } = useForm()

  return (
    <Form
      action="/api/save" // Send post request with the FormData
      // encType={'application/json'} you can also switch to json object
      onSuccess={() => {
        alert("Your application is updated.")
      }}
      onError={() => {
        alert("Submission has failed.")
      }}
      control={control}
    >
      <input {...register("firstName", { required: true })} />
      <input {...register("lastName", { required: true })} />
      <button>Submit</button>
    </Form>
  )
}
Schema Validation
We also support schema-based form validation with Yup, Zod , Superstruct & Joi, where you can pass your schema to useForm as an optional config. It will validate your input data against the schema and return with either errors or a valid result.

Step 1: Install Yup into your project.

Copy
npm install @hookform/resolvers yup
Step 2: Prepare your schema for validation and register inputs with React Hook Form.

Copy
CodeSandbox
JS
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

const schema = yup
  .object({
    firstName: yup.string().required(),
    age: yup.number().positive().integer().required(),
  })
  .required()

export default function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  })
  const onSubmit = (data) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName")} />
      <p>{errors.firstName?.message}</p>

      <input {...register("age")} />
      <p>{errors.age?.message}</p>

      <input type="submit" />
    </form>
  )
}
React Native
You will get the same performance boost and enhancement in React Native. To integrate with input component, you can wrap it with Controller.

Copy
Expo
JS
import { Text, View, TextInput, Button, Alert } from "react-native"
import { useForm, Controller } from "react-hook-form"

export default function App() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  })
  const onSubmit = (data) => console.log(data)

  return (
    <View>
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="First name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="firstName"
      />
      {errors.firstName && <Text>This is required.</Text>}

      <Controller
        control={control}
        rules={{
          maxLength: 100,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Last name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="lastName"
      />

      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
    </View>
  )
}
TypeScript
React Hook Form is built with TypeScript, and you can define a FormData type to support form values.

Copy
CodeSandbox
TS
import * as React from "react"
import { useForm } from "react-hook-form"

type FormData = {
  firstName: string
  lastName: string
}

export default function App() {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()
  const onSubmit = handleSubmit((data) => console.log(data))
  // firstName and lastName will have correct type

  return (
    <form onSubmit={onSubmit}>
      <label>First Name</label>
      <input {...register("firstName")} />
      <label>Last Name</label>
      <input {...register("lastName")} />
      <button
        type="button"
        onClick={() => {
          setValue("lastName", "luo") // ✅
          setValue("firstName", true) // ❌: true is not string
          errors.bill // ❌: property bill does not exist
        }}
      >
        SetValue
      </button>
    </form>
  )
}
Design and philosophy
React Hook Form's design and philosophy focus on user and developer experience. The library aims to provide users with a smoother interaction experience by fine-tuning the performance and improving accessibility. Some of the performance enhancements include:

Introducing form state subscription model through the proxy
Avoiding unnecessary computation
Isolating component re-rendering when required
Overall, it improves the user experience while users interact with the application. As for the developers, we introduce built-in validation and are closely aligned with HTML standards allowing further extension with powerful validation methods and integration with schema validation natively. In addition, having a strongly type-checked form with the help of typescript provides early build-time feedback to help and guide the developer to build a robust form solution.

The following talk given by Bill showcased some of the ideas and design patterns:


Thank you for your support
If you find React Hook Form to be useful in your project, please consider to star and support it.

Star us on GitHub
Home
Get Started
API
TS
Advanced
FAQs
Form Builder
DevTools
Resources
About us
Media
V6
V5
A project by BEEKAI | Please support us by leaving a ★ @github

SUPPORTED AND BACKED BY

Powered by ▲ Vercel

▲
