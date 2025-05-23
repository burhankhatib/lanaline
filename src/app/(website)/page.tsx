import { getAllProducts } from "@/sanity/lib/data/getAllProducts";
import { getAllBanners } from "@/sanity/lib/data/getAllBanners";
import Product from "@/components/Product";
import Banner from "@/components/Banner";

export default async function Home() {
  const products = await getAllProducts();
  const banners = await getAllBanners();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full mx-auto">
      <section className="flex items-center justify-center w-full h-full min-h-[600px] object-cover">
        <Banner banners={banners} />
      </section>
      <div className="flex w-full gap-4 px-4 py-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        <div className="flex gap-4">
          {products.map((product) => (
            <Product key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
