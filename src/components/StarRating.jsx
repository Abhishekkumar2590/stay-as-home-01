import {assets} from '../assets/assets.js'
const  StarRating = ({rating = 4}) => {
    return (
        <>
        {Array(5).fill('').map((_, index) => (
            <img key={index} src={rating > index ? assets.starIconFilled : assets.starIconOutlined} alt="star-icon" className="h-4 w-4" />
        ))}
        </>
    )
}

export default StarRating