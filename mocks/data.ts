// Mock data for the application

import { Child, Daycare, Clinic, Doctor, Appointment, User } from '@/types';

// Empty children array for production use
export const mockChildren: Child[] = [];

// Mock doctors data
export const mockDoctors: Doctor[] = [
  {
    id: 'd1',
    name: '鈴木 一郎',
    specialty: '小児科',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 'd2',
    name: '山田 直子',
    specialty: '小児科・アレルギー科',
    photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 'd3',
    name: '高橋 健太',
    specialty: '小児外科',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 'd4',
    name: '伊藤 美咲',
    specialty: '小児神経科',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
];

// Mock daycares data
export const mockDaycares: Daycare[] = [
  {
    id: 'dc1',
    name: '呉羽保育所',
    address: '富山市呉羽町3016',
    phone: '076-123-4567',
    email: 'kureha@example.com',
    contactPerson: '佐々木 美香',
  },
  {
    id: 'dc2',
    name: 'さくら保育園',
    address: '富山市桜木町2-5-8',
    phone: '076-234-5678',
    email: 'sakura@example.com',
    contactPerson: '田中 裕子',
  },
];

// Mock clinics data
export const mockClinics: Clinic[] = [
  {
    id: 'c1',
    name: 'くれはキッズクリニック',
    address: '富山市呉羽町2987-3',
    phone: '076-345-6789',
    email: 'kureha-kids@example.com',
    specialties: ['小児科', 'アレルギー科'],
    doctors: [
      { id: 'd1', name: '鈴木 一郎', specialty: '小児科' },
      { id: 'd2', name: '山田 直子', specialty: '小児科・アレルギー科' }
    ],
  },
  {
    id: 'c2',
    name: 'はなまる小児科',
    address: '富山市花町1-2-3',
    phone: '076-456-7890',
    email: 'hanamaru@example.com',
    specialties: ['小児科', '小児外科'],
    doctors: [
      { id: 'd3', name: '高橋 健太', specialty: '小児外科' },
      { id: 'd4', name: '伊藤 美咲', specialty: '小児神経科' }
    ],
  },
];

// Empty appointments array for production use
export const mockAppointments: Appointment[] = [];

// Empty user template for new registrations
export const emptyUser: User = {
  id: '',
  name: '',
  email: '',
  phone: '',
  children: [],
};