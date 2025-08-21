"use client"
import Image from 'next/image'
import { useScrollAnimation } from '../useScrollAnimation';

interface Testimonial {
  quote: string;
  author: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, index }) => {
  const { ref: cardRef, isVisible: cardVisible } = useScrollAnimation<HTMLDivElement>(0.1);
  
  return (
    <div 
      ref={cardRef}
      className={`
        bg-[#FBF2F099] rounded-lg p-8 shadow-sm hover:shadow-lg 
        transition-all duration-700 ease-out flex flex-col justify-between min-h-[280px]
        ${cardVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-16 opacity-0'
        }
      `}
      style={{ 
        transitionDelay: `${index * 200}ms` 
      }}
    >
      <div>
        {/* Quote Icon */}
        <Image src={"/quote.svg"} className="mb-4" alt={''} width={30} height={0}/>
        
        {/* Quote Text */}
        <blockquote className="font-arsenal text-center text-black text-lg leading-relaxed mb-6">
          {testimonial.quote}
        </blockquote>
      </div>
      
      {/* Author - This will stay at the bottom */}
      <cite className="font-arsenal font-bold text-[#BF608F] not-italic">
        {testimonial.author}
      </cite>
    </div>
  );
};

export default function Testimonials() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>(0.2);
  
  const testimonials = [
    {
      quote: "I love JoinSangha. The practice garden where you accumulate flowers for each practice streak motivates me to practice more often.",
      author: "Daveed B."
    },
    {
      quote: "I joined without any expectations. I have little to know experience in meditation but Sangha has help me easily ease my way into finding mindfulness, peace, and relief. Use Sangha as a tool for both education through meditation and to heighten your skills in enlightenment. 10 out of 10!",
      author: "Aaron E."
    },
    {
      quote: "This is the best way to keep track of your daily meditation routine. This app will allow you to connect with people in your area to find the best meditation group that fits your needs. This will be the new way to maintain your mental health alongside with like minded people.",
      author: "K.R."
    }
  ];

  return (
    <section 
      className="
        py-16 px-4 
        bg-gradient-to-b from-[#F8F8F8] via-[#FFFFFF] to-[#F8F8F8]
      "
    >
      <div className="max-w-6xl mx-auto mt-8 lg:mt-36">
        {/* Header */}
        <div 
          ref={headerRef}
          className={`
            text-center mb-12 
            transform transition-all duration-1000 ease-out
            ${headerVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-12 opacity-0'
            }
          `}
        >
          <h2 className="font-arsenal font-bold text-black text-4xl md:text-5xl font-bold mb-4">
            What do <span className="text-[#BF608F]">people</span> say about us
          </h2>
          <p className="font-arsenal text-black text-lg max-w-2xl mx-auto">
            The real impact of meditation shines through in the voices of those who practice it.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </div>
      <div className="h-10 lg:h-40"></div> 
    </section>
  );
}
