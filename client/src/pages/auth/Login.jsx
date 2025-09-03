import { Input } from "/components/ui/input";
import { Button } from "/components/ui/Button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "/components/ui/card";

function Login() {
  return (
    <div className="flex h-screen w-screen justify-center items-center bg-background text-foreground p-4">
      <Card className="w-full max-w-sm md:w-[400px] h-auto">
        <CardHeader>
          <CardTitle>Log in to your La Verdad Account</CardTitle>
          <CardDescription>
            Enter your La Verdad Email below to log in
          </CardDescription>
          <CardAction>Sign up</CardAction>
        </CardHeader>

        <CardContent>
          <Input type="email" placeholder="Email" />
        </CardContent>

        <CardContent>
          <CardAction>Forgot your password?</CardAction>
          <Input type="password" placeholder="Password" />
        </CardContent>

        <CardFooter>
          <Button className="w-full">Login</Button>
        </CardFooter>

        <CardFooter>
          <Button variant="secondary" className="w-full">
            Signin With Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Login;
