import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import Title from './Title.jsx'
import { assets, testimonials as defaultTestimonials } from '../assets/assets.js'
import StarRating from './StarRating.jsx'
import { getFeedbacks, submitFeedback } from '../lib/api.js'

const Testimonial = () => {
    const { isSignedIn, user } = useUser()
    const [reviews, setReviews] = useState(defaultTestimonials)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        userName: '',
        userEmail: '',
        rating: 5,
        comment: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [msg, setMsg] = useState('')

    const loadReviews = () => {
        getFeedbacks()
            .then((data) => {
                if (data && data.length > 0) {
                    const mapped = data.map((item, index) => ({
                        id: `api_${item.id || index}`,
                        name: item.user_name,
                        address: item.hotel_name ? `Guest at ${item.hotel_name}` : 'Verified Traveler',
                        image: assets.userIcon || defaultTestimonials[index % defaultTestimonials.length]?.image,
                        rating: item.rating,
                        review: item.comment,
                    }))
                    const formattedDefaults = defaultTestimonials.map((d, i) => ({ ...d, id: `default_${d.id || i}` }))
                    setReviews([...mapped, ...formattedDefaults].slice(0, 6))
                }
            })
            .catch(() => setReviews(defaultTestimonials.map((d, i) => ({ ...d, id: `default_${d.id || i}` }))))
    }

    useEffect(() => {
        loadReviews()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setMsg('')

        const name = formData.userName || user?.fullName || user?.firstName || 'Guest'
        const email = formData.userEmail || user?.primaryEmailAddress?.emailAddress || ''

        try {
            await submitFeedback({
                userName: name,
                userEmail: email,
                rating: formData.rating,
                comment: formData.comment,
            })
            setMsg('Thank you! Your review was submitted successfully.')
            setFormData({ userName: '', userEmail: '', rating: 5, comment: '' })
            loadReviews()
            setTimeout(() => {
                setIsModalOpen(false)
                setMsg('')
            }, 1500)
        } catch (err) {
            setMsg(err.message || 'Failed to submit feedback.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section id="experience" className="flex flex-col items-center bg-slate-50 px-6 pt-20 pb-20 md:px-12 lg:px-24">
            <Title
                title="What Our Guests Say"
                subTitle="Discover why discerning travelers consistently choose QuickStay and praise our hospitality and exceptional service around the world."
            />

            <div className="mt-8">
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-900 bg-gray-900 px-6 py-2.5 text-xs font-semibold text-white transition-all hover:bg-black active:scale-95 shadow-md cursor-pointer"
                >
                    <span>★</span> Leave Your Feedback
                </button>
            </div>

            <div className="flex flex-wrap items-stretch justify-center gap-6 mt-12 mb-12">
                {reviews.map((testimonial) => (
                    <div key={testimonial.id} className="flex flex-col justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-xs w-full hover:shadow-md transition-shadow">
                        <div>
                            <div className="flex items-center gap-3">
                                <img
                                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                    src={testimonial.image || assets.userIcon}
                                    alt={testimonial.name}
                                    onError={(e) => {
                                        e.target.onerror = null
                                        e.target.src = assets.userIcon
                                    }}
                                />
                                <div>
                                    <p className="font-playfair text-lg font-bold text-gray-900">{testimonial.name}</p>
                                    <p className="text-xs text-gray-500">{testimonial.address}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-3">
                                <StarRating rating={testimonial.rating} />
                            </div>
                            <p className="text-gray-600 text-sm mt-3 leading-relaxed">"{testimonial.review}"</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Leave Review Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="font-playfair text-xl font-bold text-gray-900">Share Your Experience</h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-700 cursor-pointer"
                            >
                                <img src={assets.closeIcon} alt="Close" className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3 text-left">
                            <div>
                                <label className="text-xs font-semibold text-gray-700">Your Rating</label>
                                <div className="mt-1 flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className={`text-2xl transition-transform hover:scale-110 cursor-pointer ${
                                                star <= formData.rating ? 'text-amber-400' : 'text-gray-300'
                                            }`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                    <span className="text-xs font-medium text-gray-500 ml-2">{formData.rating} of 5 Stars</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={formData.userName || user?.fullName || ''}
                                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                    required
                                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700">Email Address (Optional)</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.userEmail || user?.primaryEmailAddress?.emailAddress || ''}
                                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700">Your Review / Comments</label>
                                <textarea
                                    rows="4"
                                    placeholder="Tell us about the hospitality, room comfort, cleanliness, and overall experience..."
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    required
                                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
                                />
                            </div>

                            {msg && (
                                <p className={`text-xs font-medium ${msg.includes('Thank') ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {msg}
                                </p>
                            )}

                            <div className="mt-5 flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-lg bg-orange-500 px-5 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-60 cursor-pointer shadow-md shadow-orange-500/20"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </section>
    )
}

export default Testimonial
