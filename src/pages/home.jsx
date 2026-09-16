import Hero from '../components/Hero.jsx'
import FeaturedDestination from '../components/featuredDestination.jsx'
import ExclusiveOffer from '../components/Exclusiveoffer.jsx'
import Testimonial from '../components/Testimonial.jsx'
import NEWletter from '../components/NEWletter.jsx'
import Title from '../components/Title.jsx'

const ExperienceAbout = () => {
    return (
        <section id="experience" className="px-6 py-20 md:px-16 lg:px-24">
            <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                <div>
                    <Title
                        align="left"
                        font="font-playfair"
                        title="Experience the Difference"
                        subTitle="We help travelers discover stays that feel personal, premium, and stress-free from the moment they book." 
                    />

                    <p className="mt-6 max-w-xl text-base leading-7 text-zinc-600">
                        From sunrise check-ins to local recommendations and elegant rooms, every detail is crafted to make your stay memorable.
                        Explore hand-picked destinations, curated amenities, and a journey built around ease and comfort.
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                            <p className="text-3xl font-semibold text-zinc-900">12k+</p>
                            <p className="mt-2 text-sm text-zinc-600">happy stays</p>
                        </div>
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                            <p className="text-3xl font-semibold text-zinc-900">4.9/5</p>
                            <p className="mt-2 text-sm text-zinc-600">guest rating</p>
                        </div>
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                            <p className="text-3xl font-semibold text-zinc-900">24/7</p>
                            <p className="mt-2 text-sm text-zinc-600">support</p>
                        </div>
                    </div>
                </div>

                <div id="about" className="rounded-[32px] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 p-8 text-white shadow-xl">
                    <p className="text-sm uppercase tracking-[0.2em] text-zinc-300">About us</p>
                    <h3 className="mt-4 font-playfair text-3xl font-semibold">A better way to stay.</h3>
                    <p className="mt-4 text-base leading-7 text-zinc-200">
                        QuickStay brings together comfort, design, and trusted hospitality in one seamless booking experience.
                        We partner with thoughtful hosts and premium properties to match every trip with the perfect setting.
                    </p>

                    <ul className="mt-6 space-y-3 text-sm text-zinc-100">
                        <li className="flex items-center gap-3">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#49B9FF]" />
                            Curated luxury stays and boutique escapes
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#49B9FF]" />
                            Flexible booking and smooth travel planning
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#49B9FF]" />
                            Reliable service built around guest comfort
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    )
}

const Home = () => {
    return (
        <div>
            <Hero /> 
            <ExperienceAbout />
            <FeaturedDestination />
            <ExclusiveOffer />
            <Testimonial />
            <NEWletter />
        </div>
    )
}

export default Home
