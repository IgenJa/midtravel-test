"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { LinkedinIcon, InstagramIcon } from "@/components/ui/SocialIcons";
import { Card } from "@/components/ui/Card";
import type { TeamMember } from "@/types";

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const hasSocial = Boolean(
    member.social.linkedin || member.social.instagram || member.social.email
  );

  return (
    <Card padding="none" className="h-full">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={member.photo}
          alt={member.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display text-xl font-bold text-white">
            {member.name}
          </h3>
          <p className="text-sm font-medium text-teal-300">{member.position}</p>
        </div>
      </div>
      <div className="p-6">
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {member.description}
        </p>
        {hasSocial ? (
          <div className="mt-4 flex gap-3">
            {member.social.linkedin ? (
              <motion.a
                href={member.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-teal-50 hover:text-teal-600"
                aria-label={`${member.name} on LinkedIn`}
              >
                <LinkedinIcon className="h-4 w-4" />
              </motion.a>
            ) : null}
            {member.social.instagram ? (
              <motion.a
                href={member.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-teal-50 hover:text-teal-600"
                aria-label={`${member.name} on Instagram`}
              >
                <InstagramIcon className="h-4 w-4" />
              </motion.a>
            ) : null}
            {member.social.email ? (
              <motion.a
                href={`mailto:${member.social.email}`}
                whileHover={{ scale: 1.1 }}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-teal-50 hover:text-teal-600"
                aria-label={`Email ${member.name}`}
              >
                <Mail className="h-4 w-4" />
              </motion.a>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
