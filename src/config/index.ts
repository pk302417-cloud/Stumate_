export const config: {
  supabaseUrl: string;
  supabaseAnonKey: string;
  useMocks: boolean;
  listingBucket: string;
  maxImagesPerListing: number;
  maxImageSizeBytes: number;
  maxImageDimension: number;
  targetCompressedSize: number;
  listingPageSize: number;
  messageMaxLength: number;
  otpResendSeconds: number;
  listingExpiryDays: number;
} = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
  listingBucket: 'listing-images',
  maxImagesPerListing: 6,
  maxImageSizeBytes: 5 * 1024 * 1024,
  maxImageDimension: 1600,
  targetCompressedSize: 300 * 1024,
  listingPageSize: 20,
  messageMaxLength: 1000,
  otpResendSeconds: 30,
  listingExpiryDays: 60,
};
