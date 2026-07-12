import { supabase } from './supabase';
import { supabaseAdmin } from './supabase-admin';

// Helper para selecionar o cliente correto dependendo de onde o código está rodando
const getDbClient = () => {
  if (typeof window !== 'undefined') {
    return supabase; // No navegador, usa o cliente autenticado do profissional
  }
  return supabaseAdmin; // No servidor (API routes), usa o admin para ignorar RLS
};

export interface SupportTicket {
  id: string;
  userId?: string;
  userType: 'professional' | 'client' | 'guest';
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'Aberto' | 'Em Andamento' | 'Resolvido' | 'Fechado';
  priority: 'Baixa' | 'Media' | 'Alta' | 'Urgente';
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Establishment {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  imageUrl: string;
  ownerId?: string;
  openingTime?: string;
  closingTime?: string;
  lunchStart?: string;
  lunchEnd?: string;
  hasTeam?: boolean;
  state?: string;
  city?: string;
  neighborhood?: string;
  category?: string;
  amenities?: string;
}

export interface Service {
  id: string;
  establishmentId: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: string;
  imageUrl: string;
}

export interface Booking {
  id: string;
  establishmentId: string;
  serviceId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  professionalId?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  status: 'Confirmado' | 'Pendente' | 'Cancelado' | 'Concluido';
  rating?: number; // 1 a 5 estrelas
  reminderSent?: boolean;
}

export interface Professional {
  id: string;
  establishmentId: string;
  name: string;
  bio: string;
}

// Helpers para mapear snake_case do BD para camelCase no App
function mapEstablishment(data: any): Establishment {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    address: data.address,
    phone: data.phone,
    imageUrl: data.image_url,
    ownerId: data.owner_id,
    openingTime: data.opening_time || '08:00:00',
    closingTime: data.closing_time || '19:00:00',
    lunchStart: data.lunch_start || '12:00:00',
    lunchEnd: data.lunch_end || '13:00:00',
    hasTeam: data.has_team !== false,
    state: data.state || '',
    city: data.city || '',
    neighborhood: data.neighborhood || '',
    category: data.category || '',
    amenities: data.amenities || '',
  };
}

function mapService(data: any): Service {
  return {
    id: data.id,
    establishmentId: data.establishment_id,
    name: data.name,
    description: data.description,
    durationMinutes: data.duration_minutes,
    price: data.price,
    category: data.category,
    imageUrl: data.image_url,
  };
}

function mapBooking(data: any): Booking {
  return {
    id: data.id,
    establishmentId: data.establishment_id,
    serviceId: data.service_id,
    clientName: data.client_name,
    clientEmail: data.client_email,
    clientPhone: data.client_phone,
    professionalId: data.professional_id,
    date: data.date,
    time: data.time,
    status: data.status,
    rating: data.rating || undefined,
    reminderSent: !!data.reminder_sent,
  };
}

function mapProfessional(data: any): Professional {
  return {
    id: data.id,
    establishmentId: data.establishment_id,
    name: data.name,
    bio: data.bio,
  };
}

// Métodos para Estabelecimentos
export async function getEstablishments(): Promise<Establishment[]> {
  const { data, error } = await supabase.from('establishments').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching establishments:', error);
    return [];
  }
  return data.map(mapEstablishment);
}

export async function getEstablishmentById(id: string): Promise<Establishment | undefined> {
  const { data, error } = await supabase.from('establishments').select('*').eq('id', id).single();
  if (error) {
    console.error('Error fetching establishment:', error);
    return undefined;
  }
  return mapEstablishment(data);
}

export async function getEstablishmentByOwnerId(ownerId: string): Promise<Establishment | undefined> {
  const { data, error } = await supabase.from('establishments').select('*').eq('owner_id', ownerId).single();
  if (error) {
    console.error('Error fetching establishment by owner:', error);
    return undefined;
  }
  return mapEstablishment(data);
}

export async function addEstablishment(establishment: Omit<Establishment, 'id'>): Promise<Establishment | null> {
  const { data, error } = await supabase
    .from('establishments')
    .insert([
      {
        name: establishment.name,
        description: establishment.description,
        address: establishment.address,
        phone: establishment.phone,
        image_url: establishment.imageUrl,
        owner_id: establishment.ownerId,
        category: establishment.category || '',
        amenities: establishment.amenities || '',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding establishment:', error);
    return null;
  }
  return mapEstablishment(data);
}

export async function updateEstablishment(id: string, updates: Partial<Omit<Establishment, 'id' | 'ownerId'>>): Promise<Establishment | null> {
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.address !== undefined) dbUpdates.address = updates.address;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
  if (updates.openingTime !== undefined) dbUpdates.opening_time = updates.openingTime;
  if (updates.closingTime !== undefined) dbUpdates.closing_time = updates.closingTime;
  if (updates.lunchStart !== undefined) dbUpdates.lunch_start = updates.lunchStart;
  if (updates.lunchEnd !== undefined) dbUpdates.lunch_end = updates.lunchEnd;
  if (updates.hasTeam !== undefined) dbUpdates.has_team = updates.hasTeam;
  if (updates.state !== undefined) dbUpdates.state = updates.state;
  if (updates.city !== undefined) dbUpdates.city = updates.city;
  if (updates.neighborhood !== undefined) dbUpdates.neighborhood = updates.neighborhood;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.amenities !== undefined) dbUpdates.amenities = updates.amenities;

  const { data, error } = await supabase
    .from('establishments')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating establishment:', error);
    return null;
  }
  return mapEstablishment(data);
}

// Métodos para Serviços
export async function getServices(establishmentId?: string): Promise<Service[]> {
  let query = supabase.from('services').select('*').order('created_at', { ascending: true });
  if (establishmentId) {
    query = query.eq('establishment_id', establishmentId);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }
  return data.map(mapService);
}

export async function getServiceById(id: string): Promise<Service | undefined> {
  const { data, error } = await supabase.from('services').select('*').eq('id', id).single();
  if (error) {
    console.error('Error fetching service:', error);
    return undefined;
  }
  return mapService(data);
}

export async function addService(service: Omit<Service, 'id'>): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .insert([
      {
        establishment_id: service.establishmentId,
        name: service.name,
        description: service.description,
        duration_minutes: service.durationMinutes,
        price: service.price,
        category: service.category,
        image_url: service.imageUrl,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding service:', error);
    return null;
  }
  return mapService(data);
}

export async function deleteService(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service:', error);
    return false;
  }
  return true;
}

// Métodos para Agendamentos (Bookings)
export async function getBookings(establishmentId?: string): Promise<Booking[]> {
  let query = getDbClient().from('bookings').select('*').order('date', { ascending: true }).order('time', { ascending: true });
  if (establishmentId) {
    query = query.eq('establishment_id', establishmentId);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
  return data.map(mapBooking);
}

export async function getBookingsByDate(establishmentId: string, date: string, professionalId?: string): Promise<Booking[]> {
  let query = getDbClient()
    .from('bookings')
    .select('*')
    .eq('establishment_id', establishmentId)
    .eq('date', date)
    .neq('status', 'Cancelado');

  if (professionalId) {
    query = query.eq('professional_id', professionalId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching bookings by date:', error);
    return [];
  }
  return data.map(mapBooking);
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  const { data, error } = await getDbClient()
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching booking by id:', error);
    return undefined;
  }
  return mapBooking(data);
}

export async function addBooking(booking: Omit<Booking, 'id' | 'status'>): Promise<Booking | null> {
  const { data, error } = await getDbClient()
    .from('bookings')
    .insert([
      {
        establishment_id: booking.establishmentId,
        service_id: booking.serviceId,
        professional_id: booking.professionalId || null,
        client_name: booking.clientName,
        client_email: booking.clientEmail,
        client_phone: booking.clientPhone,
        date: booking.date,
        time: booking.time,
        status: 'Confirmado', // Por padrão, agendamentos já são confirmados no fluxo (mock)
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding booking:', error);
    return null;
  }
  return mapBooking(data);
}

export async function updateBookingStatus(bookingId: string, status: Booking['status']): Promise<Booking | null> {
  const { data, error } = await getDbClient()
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    console.error('Error updating booking status:', error);
    return null;
  }
  return mapBooking(data);
}

export async function rateBooking(bookingId: string, rating: number): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('bookings')
    .update({ rating })
    .eq('id', bookingId);

  if (error) {
    console.error('Error rating booking:', error);
    return false;
  }
  return true;
}

// Métodos para Profissionais (Equipe)
export async function getProfessionals(establishmentId: string): Promise<Professional[]> {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('establishment_id', establishmentId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching professionals:', error);
    return [];
  }
  return data.map(mapProfessional);
}

export async function addProfessional(professional: Omit<Professional, 'id'>): Promise<Professional | null> {
  const { data, error } = await supabase
    .from('professionals')
    .insert([
      {
        establishment_id: professional.establishmentId,
        name: professional.name,
        bio: professional.bio,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding professional:', error);
    return null;
  }
  return mapProfessional(data);
}

export async function deleteProfessional(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('professionals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting professional:', error);
    return false;
  }
  return true;
}

// Métodos para Storage
export async function uploadImage(file: File, bucketName: 'uploads'): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error('Unexpected error during image upload:', err);
    return null;
  }
}

// Mapper & Métodos para Chamados de Suporte
function mapSupportTicket(data: any): SupportTicket {
  return {
    id: data.id,
    userId: data.user_id,
    userType: data.user_type || 'professional',
    name: data.name,
    email: data.email,
    phone: data.phone,
    subject: data.subject,
    message: data.message,
    status: data.status || 'Aberto',
    priority: data.priority || 'Media',
    adminNotes: data.admin_notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>): Promise<SupportTicket | null> {
  const client = supabaseAdmin || supabase;
  const { data, error } = await client
    .from('support_tickets')
    .insert([
      {
        user_id: ticket.userId || null,
        user_type: ticket.userType || 'professional',
        name: ticket.name,
        email: ticket.email,
        phone: ticket.phone || null,
        subject: ticket.subject,
        message: ticket.message,
        priority: ticket.priority || 'Media',
        status: 'Aberto',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating support ticket:', error);
    return null;
  }
  return mapSupportTicket(data);
}

export async function getSupportTickets(statusFilter?: string): Promise<SupportTicket[]> {
  const client = supabaseAdmin || supabase;
  let query = client
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'todos') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching support tickets:', error);
    return [];
  }
  return data.map(mapSupportTicket);
}

export async function getSupportTicketsByUser(email: string): Promise<SupportTicket[]> {
  const client = supabaseAdmin || supabase;
  const { data, error } = await client
    .from('support_tickets')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user support tickets:', error);
    return [];
  }
  return data.map(mapSupportTicket);
}

export async function updateSupportTicketStatus(ticketId: string, status: SupportTicket['status'], adminNotes?: string): Promise<SupportTicket | null> {
  const client = supabaseAdmin || supabase;
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (adminNotes !== undefined) {
    updateData.admin_notes = adminNotes;
  }

  const { data, error } = await client
    .from('support_tickets')
    .update(updateData)
    .eq('id', ticketId)
    .select()
    .single();

  if (error) {
    console.error('Error updating support ticket:', error);
    return null;
  }
  return mapSupportTicket(data);
}

export async function deleteEstablishment(id: string): Promise<boolean> {
  const client = supabaseAdmin || supabase;
  const { error } = await client
    .from('establishments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting establishment:', error);
    return false;
  }
  return true;
}
