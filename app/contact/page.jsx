'use client'

import { useState } from "react"
import { postData, fetcher } from "../lib/data"
import useSWR from 'swr'

export default function Contact(){
    const { data: response } = useSWR(['/settings', { group: 'contact' }], fetcher)
    const settings = response?.data || {}

    let [firstName, setFirstName] = useState('')
    let [lastName, setLastName] = useState('')
    let [email, setEmail] = useState('')
    let [message, setMessage] = useState('')

    let submit = (e)=>{
        e.preventDefault();
        postData((res)=>{
            if(res.success){
                setFirstName('');
                setLastName('');
                setEmail('');
                setMessage('');
            }
        },{
            firstName,
            lastName,
            email,
            message
        },'/messages')
    }

    const phones = settings.contact_phones ? settings.contact_phones.split('\n') : ['0718156421', '0795666840', '0113748906'];
    const emails = settings.contact_emails ? settings.contact_emails.split('\n') : ['sales@ngwindsongk.com', 'info@ngwindsongk.com'];

    // Structured data for contact information
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact ngwindsongk",
      "description": "Get in touch with ngwindsongk for questions about our healthy oats and Nanacare products",
      "url": "https://ngwindsongk.com/contact",
      "mainEntity": {
        "@type": "Organization",
        "name": "ngwindsongk",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Bazaar Plaza",
          "addressLocality": "Nairobi",
          "addressCountry": "Kenya"
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": phones[0],
            "contactType": "customer service",
            "areaServed": "Kenya",
            "availableLanguage": "English"
          },
          {
            "@type": "ContactPoint",
            "email": emails[0],
            "contactType": "customer service",
            "areaServed": "Worldwide"
          }
        ]
      }
    };

    return(
        <main className="flex flex-col md:flex-row my-10 md:min-h-[70vh] items-center">
            {/* Structured Data */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData)
              }}
            />
            
            <div className="mx-4 md:w-3/4 md:mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-6 tracking-tight">
                        {settings.contact_headline || 'Get in touch'}
                    </h1>
                    <p className="md:w-2/3 text-lg text-gray-500 font-medium leading-relaxed">
                        {settings.contact_description || "Have a question about our products, deliveries, or anything else? We'd love to hear from you. Fill out the form below and our team will get back to you as soon as possible."}
                    </p>
                </header>

                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                    <div className="lg:w-3/5 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block mb-2 text-sm font-black uppercase tracking-widest text-gray-400" htmlFor="firstName">First name</label>
                                    <input 
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white py-4 px-6 rounded-2xl outline-none transition-all font-medium" 
                                        type="text" 
                                        id="firstName"
                                        placeholder="Jane" 
                                        value={firstName} 
                                        onChange={e=>{setFirstName(e.target.value)}} 
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-black uppercase tracking-widest text-gray-400" htmlFor="lastName">Last name</label>
                                    <input 
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white py-4 px-6 rounded-2xl outline-none transition-all font-medium" 
                                        type="text" 
                                        id="lastName"
                                        placeholder="Doe" 
                                        value={lastName} 
                                        onChange={e=>{setLastName(e.target.value)}} 
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-black uppercase tracking-widest text-gray-400" htmlFor="email">Email Address</label>
                                <input 
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white py-4 px-6 rounded-2xl outline-none transition-all font-medium" 
                                    type="email" 
                                    id="email"
                                    placeholder="jane@example.com" 
                                    value={email} 
                                    onChange={e=>{setEmail(e.target.value)}} 
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-black uppercase tracking-widest text-gray-400" htmlFor="message">Your Message</label>
                                <textarea 
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white py-4 px-6 rounded-2xl outline-none transition-all font-medium h-40 resize-none" 
                                    id="message"
                                    placeholder="How can we help you?" 
                                    value={message} 
                                    onChange={e=>{setMessage(e.target.value)}} 
                                    required
                                ></textarea>
                            </div>
                            <button 
                                type="submit"
                                className="bg-primary w-full md:w-fit py-4 px-12 text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                    <div className="lg:w-2/5 space-y-12">
                        {/* Location */}
                        <div className="group">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3">
                                <span className="w-8 h-px bg-gray-200"></span> Location
                            </h3>
                            <div className="flex gap-6">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg shadow-primary/5">
                                    <span className="icon-[solar--map-point-bold-duotone] w-8 h-8"/>
                                </div>
                                <a href={settings.contact_maps_url || "https://maps.app.goo.gl/yGuJeUQddbhW9wcF7"} className="block group/link">
                                    <address className="not-italic text-lg font-bold text-gray-800 leading-relaxed group-hover/link:text-primary transition-colors">
                                        {settings.contact_address ? (
                                            <div dangerouslySetInnerHTML={{ __html: settings.contact_address }} />
                                        ) : (
                                            <>Rashali GoDown, No. 2 <br /> Maasai Road, off Mombasa road</>
                                        )}
                                    </address>
                                </a>
                            </div>
                        </div>

                        {/* Phones */}
                        <div className="group">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3">
                                <span className="w-8 h-px bg-gray-200"></span> Call Us
                            </h3>
                            <div className="flex gap-6">
                                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary shrink-0 group-hover:bg-secondary group-hover:text-white transition-all duration-500 shadow-lg shadow-secondary/5">
                                    <span className="icon-[solar--phone-bold-duotone] w-8 h-8"/>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {phones.map((phone, i) => (
                                        <a key={i} className="text-lg font-bold text-gray-800 hover:text-secondary transition-colors" href={`tel:${phone}`}>{phone}</a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Emails */}
                        <div className="group">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3">
                                <span className="w-8 h-px bg-gray-200"></span> Email Us
                            </h3>
                            <div className="flex gap-6">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg shadow-primary/5">
                                    <span className="icon-[solar--letter-bold-duotone] w-8 h-8"/>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {emails.map((email, i) => (
                                        <a key={i} className="text-lg font-bold text-gray-800 hover:text-primary transition-colors truncate max-w-[200px] md:max-w-none" href={`mailto:${email}`}>{email}</a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Background Decoration */}
            <div className="fixed top-0 right-0 -z-10 w-1/3 h-screen bg-gradient-to-l from-primary/5 via-transparent to-transparent pointer-events-none" />
        </main>
    )
}