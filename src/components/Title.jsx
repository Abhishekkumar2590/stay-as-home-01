const Title = ({ title, subTitle, align = 'center', font = 'font-playfair' }) => {
  const isLeftAligned = align === 'left'

  return (
    <div className={`flex flex-col ${isLeftAligned ? 'items-start text-left' : 'items-center text-center'}`}>
      <h2 className={`text-[34px] leading-tight font-medium tracking-[-0.025em] text-zinc-950 md:text-[42px] ${font}`}>
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-base leading-7 font-medium text-zinc-500 md:text-lg md:leading-[1.65]">
        {subTitle}
      </p>
    </div>
  )
}

export default Title
