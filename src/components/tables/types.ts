
export interface TableData {
  id: string;
  name: string;
  capacity: number;
  status: 'empty' | 'occupied' | 'booked';
  location: string;
  isLinked: boolean;
  linkedWith?: string[];
}

export type TableView = 'layout' | 'list';

export interface TableFormValues {
  name: string;
  capacity: number;
  location: string;
  status?: 'empty' | 'occupied' | 'booked';
}
