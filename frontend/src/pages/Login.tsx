import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "@/lib/auth-client"
import { useNavigate } from "react-router-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import image from "@/assets/img/image.png"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
    })

    if (error) {
      form.setError("email", {
        message: "Email atau password salah",
      })
      return
    }

    navigate("/dashboard")
  }

  return (
    <div
      className={cn("flex min-h-screen items-center justify-center bg-background p-4", className)}
      {...props}
    >
      <Card className="overflow-hidden p-0 w-full max-w-4xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* LEFT SIDE FORM */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 md:p-8 space-y-6"
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your SNS Analytical account
                </p>
              </div>

              {/* EMAIL */}
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="email@contoh.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </Field>

              {/* PASSWORD */}
              <Field>
                <div className="flex items-center">
                  <FieldLabel>Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </Field>

              {/* BUTTON */}
              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Login..." : "Login"}
                </Button>
              </Field>

              <FieldSeparator>
                Don't have an account? 
              </FieldSeparator>

              <FieldDescription className="text-center">
                <a href="/register" className="underline">
                  Sign up
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* RIGHT SIDE IMAGE */}
          <div className="bg-muted relative hidden md:block">
            <img
              src={image}
              alt="Login"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}