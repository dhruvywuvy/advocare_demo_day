'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInUser } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import  {supabase} from '@/src/lib/supabase';

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {

      const { user, profile, error } = await signInUser(formData.email, formData.password);


      if (error) {
        throw error;
      }

      if (user) {
        console.log('Login response data:', { user, profile });
        //const currentUser = await supabase.auth.getUser()
        router.push('/marketplace');

        // Handle successful login here - e.g., redirect or update app state
      }

    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to login. Please check your email and password.');
      console.error('Login error:', error);
    } finally{
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-6 space-y-6">
      <h2 className="text-2xl mr-10 font-bold text-center">Login to Your Account</h2>
      
      {errorMessage && (
        <p className="text-red-500">{errorMessage}</p>
      )}

      <form onSubmit={handleSubmit} className=" space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <div className="text-center mr-10">
        <a href="/signup " >
          Don't have an account? Create one
        </a>
      </div>
    </div>
  );
}