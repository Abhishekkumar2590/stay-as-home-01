import { exclusiveOffers, assets } from '../assets/assets.js'
import Title from './Title.jsx'

const ExclusiveOffer = () => {
    return (
        <section className="bg-white py-20 md:py-24">
            <div className="mx-auto max-w-7xl px-6 md:px-16 lg:px-24 xl:px-32">
                <Title
                    align="left"
                    title="Exclusive Offers"
                    subTitle="Take advantage of our limited-time offers and special packages to enhance your stay and create unforgettable memories."
                />



                <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {exclusiveOffers.map((offer) => (
                        <article key={offer._id} className="group overflow-hidden rounded-2xl bg-slate-50 shadow-sm ring-1 ring-gray-200">
                            <div className="relative">
                                <img src={offer.image} alt={offer.title} className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                <span className="absolute top-4 left-4 rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900">
                                    {offer.priceOff}% off
                                </span>
                            </div>
                            <div className="p-5">
                                <h3 className="font-playfair text-2xl text-gray-900">{offer.title}</h3>
                                <p className="mt-2 min-h-14 text-sm leading-6 text-gray-600">{offer.description}</p>
                                <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                                    <span className="text-gray-500">Ends {offer.expiryDate}</span>
                                    <button href="/rooms" className="flex items-center gap-2 font-medium text-gray-900">
                                        View offer
                                        <img src={assets.arrowIcon} alt="" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default ExclusiveOffer