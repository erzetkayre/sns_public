import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUp } from "@/lib/auth-client"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import image1 from "@/assets/img/image1.png"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import {
  Form,
  FormField,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

export default function RegisterPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    const { error } = await signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
    })

    if (error) {
      form.setError("email", { message: error.message })
      return
    }

    navigate("/dashboard")
  }

  return (
    <div
      className={cn("flex min-h-screen items-center justify-center bg-background p-6", className)}
      {...props}
    >
      <Card className="overflow-hidden p-0 w-full max-w-4xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* LEFT SIDE FORM */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 md:p-8"
            >
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Create your account</h1>
                  <p className="text-muted-foreground text-sm">
                    Enter your details below to create your account
                  </p>
                </div>

                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Full Name</FieldLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Email</FieldLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="m@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FieldDescription>
                        We'll use this email to contact you. We will never share it.
                      </FieldDescription>
                      <FormMessage />
                    </Field>
                  )}
                />

                {/* Password Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Password</FieldLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Confirm Password</FieldLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    )}
                  />
                </div>

                <FieldDescription>
                  Your password must be at least 8 characters long.
                </FieldDescription>

                {/* Submit */}
                <Field>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? "Creating account..."
                      : "Create Account"}
                  </Button>
                </Field>

                <FieldSeparator>
                  Already have an account?
                </FieldSeparator>

                <FieldDescription className="text-center">
                  <a
                    href="/login"
                    className="text-primary hover:underline"
                  >
                    Sign in instead
                  </a>
                </FieldDescription>
              </FieldGroup>
            </form>
          </Form>

          {/* RIGHT SIDE IMAGE */}
          <div className="bg-muted relative hidden md:block">
            <img
              src={image1}
              alt="Register Illustration"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="absolute bottom-6 text-center text-sm text-muted-foreground">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </FieldDescription>
    </div>
  )
}