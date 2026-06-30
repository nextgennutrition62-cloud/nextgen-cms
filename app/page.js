import { getAllContent, getAllSettings, getActiveProducts } from '@/lib/data';
import HomeClient from '@/components/HomeClient';

export const revalidate = 0; // секогаш свежи податоци, без cache

export default async function Home() {
  const [content, settings, products] = await Promise.all([
    getAllContent(),
    getAllSettings(),
    getActiveProducts(),
  ]);

  return <HomeClient content={content} settings={settings} products={products} />;
}
