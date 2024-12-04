'use client'
import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Advocate {
  id: number;
  name: string;
  title: string;
  rating: number;
  image: string;
  experience: string;
  details: string[];
  expertise: string[];
  isBestMatch?: boolean;
}

const AdvocateCards = () => {
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null);
  const router = useRouter();

  const advocates: Advocate[] = [
    {
      id: 1,
      name: "Io Dolka",
      title: "RN",
      rating: 4.5,
      image: "/profile_pictures/iodolka.jpg",
      experience: "10 years of experience in pediatric nursing at Mayo Clinic",
      details: [
        "Specializes in medical bill review and negotiation",
        "Successfully reduced bills by an average of 40% for clients",
        "Expert in identifying billing errors and overcharges",
        "Deep understanding of insurance claims and appeals processes"
      ],
      expertise: ["Medical Bill Review", "Insurance Appeals", "Patient Advocacy"],
      isBestMatch: true
    },
    {
      id: 2,
      name: "Cindy Johnson",
      title: "MSN",
      rating: 5.0,
      image: "/profile_pictures/cindyjohnson.jpg",
      experience: "Lead nurse educator at Cleveland Clinic for 5 years",
      details: [
        "Specialized in complex medical billing disputes",
        "Former hospital billing department supervisor",
        "Expert in healthcare pricing transparency",
        "Strong track record in negotiating with insurance companies"
      ],
      expertise: ["Billing Disputes", "Insurance Negotiation", "Healthcare Policy"],
      isBestMatch: false
    }
  ];

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={`text-yellow-400 ${i < Math.floor(rating) ? 'opacity-100' : 'opacity-30'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {advocates.map((advocate) => (
          <Card 
            key={advocate.id}
            className={`cursor-pointer transition-all hover:shadow-lg relative
              ${selectedAdvocate?.id === advocate.id ? 'ring-2 ring-teal-500' : ''}
              ${advocate.isBestMatch ? 'ring-2 ring-teal-500 animate-pulse-border' : ''}
            `}
            onClick={() => setSelectedAdvocate(advocate)}
          >
            {advocate.isBestMatch && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium z-10">
                Best Match for Your Case
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 
                  ${advocate.isBestMatch ? 'ring-4 ring-teal-500 ring-opacity-50' : ''}`}>
                  <Image
                    src={advocate.image}
                    alt={`${advocate.name}'s profile picture`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 64px) 100vw"
                    priority
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">
                    {advocate.name} <span className="text-gray-500">{advocate.title}</span>
                  </h3>
                  <div className="flex items-center">
                    {renderStars(advocate.rating)}
                    <span className="ml-2 text-gray-600">{advocate.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{advocate.experience}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedAdvocate && (
        <Card className="mt-6">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">About {selectedAdvocate.name}</h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Areas of Expertise:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedAdvocate.expertise.map((item, index) => (
                  <span key={index} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Experience & Qualifications:</h4>
              <ul className="list-disc pl-5 space-y-2">
                {selectedAdvocate.details.map((detail, index) => (
                  <li key={index} className="text-gray-600">{detail}</li>
                ))}
              </ul>
            </div>

            <Button 
              className="w-full md:w-auto bg-teal-500 hover:bg-teal-600 text-white"
              onClick={() => {
                console.log(`Working with ${selectedAdvocate.name}`);
                router.push('/dashboard');
              }}
            >
              Work with {selectedAdvocate.name}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdvocateCards;