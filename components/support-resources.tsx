'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Phone, MessageCircle, Users, Heart, BookOpen } from 'lucide-react'

const RESOURCES = [
  {
    category: 'Crisis Support',
    icon: Phone,
    color: 'from-red-500 to-rose-500',
    resources: [
      {
        name: 'National Problem Gambling Helpline',
        description: '24/7 confidential support',
        contact: '1-800-522-4700',
        link: 'tel:1-800-522-4700'
      },
      {
        name: 'Crisis Text Line',
        description: 'Text HOME to 741741',
        contact: 'Text HOME',
        link: 'sms:741741?body=HOME'
      },
      {
        name: 'National Suicide Prevention Lifeline',
        description: '24/7 mental health crisis',
        contact: '1-800-273-8255',
        link: 'tel:1-800-273-8255'
      }
    ]
  },
  {
    category: 'Support Groups',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    resources: [
      {
        name: 'Gamblers Anonymous',
        description: 'Peer-led support groups nationwide',
        contact: 'www.gamblersanonymous.org',
        link: 'https://www.gamblersanonymous.org'
      },
      {
        name: 'SMART Recovery',
        description: 'Science-based self-empowerment',
        contact: 'www.smartrecovery.org',
        link: 'https://www.smartrecovery.org'
      },
      {
        name: 'Online AA Meetings',
        description: 'Virtual support communities',
        contact: 'www.aa.org',
        link: 'https://www.aa.org'
      }
    ]
  },
  {
    category: 'Mental Health Care',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    resources: [
      {
        name: 'SAMHSA National Helpline',
        description: 'Free referral & info service',
        contact: '1-800-662-4357',
        link: 'tel:1-800-662-4357'
      },
      {
        name: 'Psychology Today Therapist Finder',
        description: 'Find therapists in your area',
        contact: 'www.psychologytoday.com',
        link: 'https://www.psychologytoday.com'
      },
      {
        name: 'BetterHelp Online Therapy',
        description: 'Affordable online counseling',
        contact: 'www.betterhelp.com',
        link: 'https://www.betterhelp.com'
      }
    ]
  },
  {
    category: 'Education & Resources',
    icon: BookOpen,
    color: 'from-purple-500 to-indigo-500',
    resources: [
      {
        name: 'Stop It Now',
        description: 'Evidence-based gambling resources',
        contact: 'www.stopitnow.org',
        link: 'https://www.stopitnow.org'
      },
      {
        name: 'Council on Problem Gambling',
        description: 'Prevention & education programs',
        contact: 'www.ncpg.org',
        link: 'https://www.ncpg.org'
      },
      {
        name: 'National Institute on Drug Abuse',
        description: 'Addiction science & research',
        contact: 'www.nida.nih.gov',
        link: 'https://www.nida.nih.gov'
      }
    ]
  }
]

export function SupportResources() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">
          Support & Resources
        </h1>
        <p className="text-muted-foreground">
          You're not alone. Here are trusted resources to support your recovery.
        </p>
      </motion.section>

      {/* Resources Sections */}
      {RESOURCES.map((section, sectionIdx) => {
        const Icon = section.icon
        return (
          <motion.section
            key={section.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIdx * 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center`}>
                <Icon size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{section.category}</h2>
            </div>

            <div className="grid gap-3">
              {section.resources.map((resource, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (sectionIdx * 0.1) + (idx * 0.05) }}
                >
                  <Card className="p-5 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {resource.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {resource.description}
                        </p>
                        <p className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block">
                          {resource.contact}
                        </p>
                      </div>
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 mt-1"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary group-hover:bg-primary/10"
                        >
                          <ExternalLink size={18} />
                        </Button>
                      </a>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )
      })}

      {/* Emergency Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-2xl">🆘</span>
            Crisis Support
          </h3>
          <p className="text-sm text-foreground mb-4">
            If you're in immediate crisis or having thoughts of self-harm, please reach out right now:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="tel:988">
              <Button className="w-full bg-red-600 hover:bg-red-700" size="lg">
                <Phone size={20} className="mr-2" />
                Call 988 (Suicide & Crisis)
              </Button>
            </a>
            <a href="tel:911">
              <Button className="w-full bg-red-600 hover:bg-red-700" size="lg">
                <Phone size={20} className="mr-2" />
                Call 911 Emergency
              </Button>
            </a>
          </div>
        </Card>
      </motion.div>

      {/* Self-Exclusion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6 border-2 border-primary/30">
          <h3 className="font-semibold text-foreground mb-3">Self-Exclusion Programs</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Self-exclude from gambling websites and casinos. This is often the most effective way to prevent gambling:
          </p>
          <div className="space-y-2">
            <a href="https://www.ncpg.org" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full justify-between">
                <span>National Council on Problem Gambling</span>
                <ExternalLink size={18} />
              </Button>
            </a>
            <a href="https://www.gamban.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full justify-between">
                <span>Gamban - Blocking Software</span>
                <ExternalLink size={18} />
              </Button>
            </a>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
