
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calendar, Users, BarChart, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeInOut" },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeInFromBottom = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};


export default function LandingPage() {
  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: "Effortless Scheduling",
      description: "Manage appointments with an intuitive calendar. View schedules by day, week, or month.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Patient Management",
      description: "Keep detailed patient records, track progress, and manage therapy packages all in one place.",
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Session Tracking",
      description: "Log health notes, track payments, and manage check-ins for every session seamlessly.",
    },
    {
      icon: <BarChart className="h-8 w-8 text-primary" />,
      title: "Multi-Clinic Ready",
      description: "Scale your business with a system built to handle multiple clinic locations from a single admin account.",
    },
  ];

  const testimonials = [
    {
      quote: "ConnectPhysio has revolutionized how we manage our clinic. Scheduling is a breeze and our patient records have never been more organized.",
      name: "Dr. Emily Carter",
      title: "Lead Physiotherapist, HealWell Clinic",
      avatar: "https://placehold.co/100x100.png",
    },
    {
      quote: "The ability to manage multiple locations from one dashboard is a game-changer for our franchise. It's intuitive, powerful, and has saved us countless hours.",
      name: "John Maxwell",
      title: "Owner, FlexFit Physio Centers",
      avatar: "https://placehold.co/100x100.png",
    },
     {
      quote: "As a receptionist, the check-in system and patient dashboard are fantastic. I can see the whole day at a glance and manage appointments with just a few clicks.",
      name: "Sarah Chen",
      title: "Clinic Receptionist, MotionWorks",
      avatar: "https://placehold.co/100x100.png",
    },
  ];

  const faqs = [
    {
      question: "Is ConnectPhysio suitable for a solo practitioner?",
      answer: "Absolutely! While it's powerful enough for multi-clinic franchises, its intuitive design makes it a perfect tool for solo practitioners looking to streamline their operations and present a professional image to their clients.",
    },
    {
      question: "Can I customize therapy packages for my clinic?",
      answer: "Yes. The admin dashboard allows you to create, edit, and manage unique therapy packages tailored to your clinic's services, including setting the number of sessions, duration, and price.",
    },
    {
      question: "Is my patient data secure?",
      answer: "We take data security very seriously. All data is stored securely, and the application is built with role-based access control, meaning staff can only see the information relevant to their position.",
    },
    {
      question: "Does it work on mobile devices?",
      answer: "Yes, ConnectPhysio is fully responsive, allowing you and your staff to manage the clinic from a desktop, tablet, or smartphone, ensuring you're always connected.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24 items-center"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <motion.div className="flex flex-col justify-center space-y-4" variants={fadeInFromBottom}>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Streamline Your Clinic, Elevate Your Care
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    ConnectPhysio is the all-in-one platform designed to simplify your physiotherapy practice management, from patient bookings to multi-clinic oversight.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button size="lg" className="w-full min-[400px]:w-auto">Get Started</Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">Learn More</Button>
                  </Link>
                </div>
              </motion.div>
               <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.8, delay: 0.4, ease: "backOut" }}
               >
                 <Image
                    src="https://placehold.co/600x400.png"
                    data-ai-hint="dashboard physiotherapy"
                    width="600"
                    height="400"
                    alt="ConnectPhysio Dashboard"
                    className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full"
                  />
               </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInFromBottom}
            >
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Run Your Practice</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Focus on your patients, we'll handle the rest. Our powerful features are designed to be intuitive and save you time.
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-4 mt-12"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInFromBottom}
                  className="grid gap-2 text-center"
                >
                  <div className="flex justify-center">{feature.icon}</div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <motion.div 
              className="space-y-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInFromBottom}
            >
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Trusted by Clinics of All Sizes</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                See what our satisfied users are saying about how ConnectPhysio has improved their practice.
              </p>
            </motion.div>
            <motion.div 
              className="grid w-full grid-cols-1 lg:grid-cols-3 gap-8 mt-8"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.name}
                  variants={fadeInFromBottom}
                >
                  <Card>
                    <CardContent className="flex flex-col items-center text-center p-6">
                       <Image
                          src={testimonial.avatar}
                          width="80"
                          height="80"
                          alt={`Avatar of ${testimonial.name}`}
                          className="rounded-full mb-4"
                        />
                      <p className="text-sm text-muted-foreground italic">&quot;{testimonial.quote}&quot;</p>
                      <div className="mt-4">
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.title}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInFromBottom}
            >
              <div className="space-y-2">
                 <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Frequently Asked Questions</h2>
                 <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Have questions? We've got answers.
                </p>
              </div>
            </motion.div>
             <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeInFromBottom}
                className="mx-auto max-w-3xl w-full mt-12"
             >
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-lg">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-base">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
             </motion.div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <motion.div 
              className="space-y-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInFromBottom}
            >
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Ready to Transform Your Practice?</h2>
              <p className="mx-auto max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join dozens of clinics who trust ConnectPhysio. Get started today and get back to what you do best.
              </p>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="mt-4">
                  Start Your Free Trial <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
