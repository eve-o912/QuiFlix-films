"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FilmCard } from "@/components/film-card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { SignupModal } from "@/components/signup-modal"
import { faqs } from "@/utils/faq"
import { trendingFilms } from "@/utils/trending"
import Image from "next/image"
import { PageLayout } from "@/components/page-layout"

export default function LandingPage() {
    const [authOpen, setAuthOpen] = useState(false)


    return (
        <PageLayout fullWidth>
            {/* Hero Section with background image */}
            <section className="relative w-full flex flex-col items-center justify-center min-h-screen h-screen overflow-hidden">
                <Image
                    src="/cinematic-movie-theater-with-neon-lights.jpg"
                    alt="Hero Background"
                    fill
                    className="object-cover opacity-60 z-0"
                    priority
                />
                {/* Centered hero content */}
                <div className="relative z-10 flex flex-col items-center justify-center px-4 py-20">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance text-center">
                        Own Your Movie
                        <span className="text-primary block">Experience</span>
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance text-center">
                        Stream premium films and own NFT tickets. No wallet? No problem. Buy directly and claim your NFT anytime.
                    </p>
                    
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-3 shadow-lg" onClick={() => setAuthOpen(true)}>
                                Sign In
                            </Button>
                            <SignupModal open={authOpen} onOpenChange={setAuthOpen} />

                </div>
            </section>


            {/* Why QuiFlix Section */}
            <section className="relative z-10 w-full max-w-5xl mx-auto px-4 py-16 bg-background">
                <h2 className="text-3xl font-bold mb-6 text-center text-primary">Why Choose QuiFlix?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="bg-card rounded-lg p-8 shadow">
                        <h3 className="text-xl font-semibold mb-2 text-primary">True Ownership</h3>
                        <p className="text-muted-foreground">Own your movie experience with NFT tickets that prove your access and support for creators.</p>
                    </div>
                    <div className="bg-card rounded-lg p-8 shadow">
                        <h3 className="text-xl font-semibold mb-2 text-primary">No Wallet? No Problem</h3>
                        <p className="text-muted-foreground">Buy films directly with traditional payments and claim your NFT anytime—no crypto knowledge required.</p>
                    </div>
                    <div className="bg-card rounded-lg p-8 shadow">
                        <h3 className="text-xl font-semibold mb-2 text-primary">Support Creators</h3>
                        <p className="text-muted-foreground">Your purchases go directly to filmmakers, empowering a new era of independent cinema.</p>
                    </div>
                </div>
            </section>

            {/* Trending Section */}
            <section className="relative z-10 w-full max-w-6xl mx-auto px-4 py-12 bg-background">
                <h2 className="text-3xl font-bold mb-6 text-center text-primary">Trending Now</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {trendingFilms.map(film => (
                        <FilmCard key={film.id} title={film.title} poster={film.poster} id={""} year={0} genre={""} rating={0} price={""} />
                    ))}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="relative z-10 w-full max-w-4xl mx-auto px-4 py-16 bg-background">
                <h2 className="text-3xl font-bold mb-8 text-center text-primary">What Our Users Say</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-card rounded-lg p-6 shadow flex flex-col items-center">
                        <img src="/placeholder-user.jpg" alt="User 1" className="h-16 w-16 rounded-full mb-4" />
                        <p className="italic mb-2">"QuiFlix made it so easy to support my favorite indie filmmakers and actually own my movie tickets!"</p>
                        <span className="font-semibold text-primary">— Alex M.</span>
                    </div>
                    <div className="bg-card rounded-lg p-6 shadow flex flex-col items-center">
                        <img src="/placeholder-user.jpg" alt="User 2" className="h-16 w-16 rounded-full mb-4" />
                        <p className="italic mb-2">"I love that I can buy movies without a crypto wallet and claim my NFT later. Super simple!"</p>
                        <span className="font-semibold text-primary">— Jamie L.</span>
                    </div>
                    <div className="bg-card rounded-lg p-6 shadow flex flex-col items-center">
                        <img src="/placeholder-user.jpg" alt="User 3" className="h-16 w-16 rounded-full mb-4" />
                        <p className="italic mb-2">"The future of streaming is here. QuiFlix is empowering both viewers and creators!"</p>
                        <span className="font-semibold text-primary">— Priya S.</span>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative z-10 w-full max-w-3xl mx-auto px-4 py-12 bg-background">
                <h2 className="text-3xl font-bold mb-6 text-center text-primary">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, idx) => (
                        <AccordionItem value={faq.question} key={idx}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>

            {/* Footer */}
            <footer className="relative z-10 w-full bg-background/80 border-t border-muted py-6 mt-8 flex flex-col items-center text-center text-muted-foreground">
                <div className="flex flex-row items-center gap-2 mb-2">
                    <Image
                        src="/quiflixlogo.png"
                        alt="QuiFlix Logo"
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                    />
                    <span className="font-bold text-lg">QuiFlix</span>
                </div>
                <div className="text-xs">&copy; {new Date().getFullYear()} QuiFlix. All rights reserved.</div>
            </footer>
        </PageLayout>
    )
}
