import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { join } from 'path';
import { Resend } from 'resend';
import { EmailType } from './types/email.type';
import { HbsTemplate } from './types/hbs-template.type';

@Injectable()
export class ResendService {
  private readonly resendOwner: string;
  private readonly apiUrl: string;
  private readonly clientUrl: string;

  private readonly currentYear = new Date().getFullYear().toString();
  private readonly resend: Resend;
  private readonly logger = new Logger(ResendService.name);

  private readonly rootPath: string = join(
    __dirname,
    '..',
    '..',
    'src',
    'resend',
    'templates',
  );

  private readonly stylesPath: string = join(
    __dirname,
    '..',
    '..',
    'src',
    'resend',
    'styles',
  );

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
    this.resendOwner = this.configService.get('RESEND_OWNER');
    this.apiUrl = this.configService.get('API_URL');
    this.clientUrl = this.configService.get('CLIENT_URL');
  }

  private async sendEmail(emailData: EmailType) {
    try {
      const email = { ...emailData, from: this.resendOwner };
      const result = await this.resend.emails.send(email);

      this.logger.log(`Email sent to ${email.to} successfully.`);
      return result;
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error;
    }
  }

  private async renderTemplateAsync(
    templatePath: string,
    variables?: HbsTemplate,
  ): Promise<string> {
    const templateSource = await fs.promises.readFile(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);

    const stylesPath = join(this.stylesPath, 'email-style.css');
    const styles = await fs.promises.readFile(stylesPath, 'utf8');

    return template({ ...variables, styles });
  }

  private async sendTemplateEmail(
    email: string,
    subject: string,
    templateFileName: string,
    variables: HbsTemplate,
  ): Promise<void> {
    const templatePath = join(this.rootPath, templateFileName);
    const htmlContent = await this.renderTemplateAsync(templatePath, variables);

    await this.sendEmail({
      to: email,
      subject,
      html: htmlContent,
      from: this.resendOwner,
    });
  }

  async sendConfirmEmailLetter(
    email: string,
    activationToken: string,
  ): Promise<void> {
    await this.sendTemplateEmail(
      email,
      'Welcome! Activate Your Account.',
      'activation-email.template.hbs',
      {
        API_URL: this.apiUrl,
        activationToken,
        supportEmail: this.resendOwner,
        year: this.currentYear,
      },
    );
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    await this.sendTemplateEmail(
      email,
      'Reset Your Password',
      'reset-password.template.hbs',
      {
        API_URL: this.apiUrl,
        resetToken,
        supportEmail: this.resendOwner,
        year: this.currentYear,
      },
    );
  }

  async sendPasswordChangedSuccess(email: string): Promise<void> {
    await this.sendTemplateEmail(
      email,
      'Password Changed Successfully',
      'password-changed-success.template.hbs',
      {
        supportEmail: this.resendOwner,
        year: this.currentYear,
        CLIENT_URL: this.clientUrl,
      },
    );
  }

  async sendReminderEmail(
    email: string,
    title: string,
    reminderDate: Date,
    message: string,
    eventUrl: string,
  ): Promise<void> {
    await this.sendTemplateEmail(email, title, 'reminder.template.hbs', {
      title,
      reminderDate: reminderDate.toDateString(),
      message,
      eventUrl,
      clientUrl: this.clientUrl,
      supportEmail: this.resendOwner,
      year: this.currentYear,
    });
  }
}
