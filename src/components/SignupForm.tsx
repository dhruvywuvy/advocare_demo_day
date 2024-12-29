
'use client'
import { useState } from 'react';
//import router, { useRouter } from 'next/router';
import { useRouter } from 'next/navigation';
import { signUpUser, UserProfile } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';

export default function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
    fullName: '',
    phoneNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleUserTypeChange = (value: string) => {
    // setFormData({...formData, userProfile: value });
    setFormData({...formData, 'userType': value});
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      await signUpUser(
        formData.email,
        formData.password,
        formData.userType,
        formData.fullName,
        formData.phoneNumber
      );
      router.push('/form');
    } catch (error) {
      setErrorMessage('Failed to create account. Please try again.');
      console.log("formData: ", formData, "error: ", error);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center mr-10">Create an Account</h2>

        {errorMessage && (
          <p className="text-red-500">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
            value={formData.fullName}
              onChange={handleChange}
            />
          </div>

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
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>I am a</Label>
            <RadioGroup
              value={formData.userType}
              onValueChange={handleUserTypeChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="patient" id="patient" />
                <Label htmlFor="patient">Patient</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advocate" id="advocate" />
                <Label htmlFor="advocate">Medical Advocate</Label>
              </div>
            </RadioGroup>
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>
      </div>
    </div>
  );
}